"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { checkoutSchema } from "@/lib/validators";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import {
  getAppUrl,
  getPreferenceClient,
  isMpConfigured,
} from "@/lib/mercadopago";

export async function createOrderAction(formData: FormData) {
  let items: {
    productId: number;
    quantity: number;
    unitPrice?: number;
    selectedOptions?: string;
  }[] = [];
  try {
    items = JSON.parse(formData.get("items")?.toString() || "[]");
  } catch {
    items = [];
  }

  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    address: formData.get("address"),
    items,
  });

  if (!parsed.success) {
    redirect(
      `/checkout?error=${encodeURIComponent(
        parsed.error.issues[0]?.message || "Revisa los datos del formulario"
      )}`
    );
  }

  const { customerName, customerEmail, customerPhone, address, items: cartItems } =
    parsed.data;

  const productRows = await db.query.products.findMany({
    where: (p, { inArray }) =>
      inArray(
        p.id,
        cartItems.map((i) => i.productId)
      ),
  });

  if (productRows.length === 0) {
    redirect(`/checkout?error=${encodeURIComponent("El carrito está vacío")}`);
  }

  let total = 0;
  const rowsToInsert = cartItems.flatMap((item) => {
    const product = productRows.find((p) => p.id === item.productId);
    if (!product) return [];
    const quantity = Math.min(
      item.quantity,
      Math.max(product.stock, 0) || item.quantity
    );
    // Precio ya ajustado por las opciones elegidas (RAM, disco, etc.),
    // calculado en el cliente. Si no viene (o es inválido), se usa el
    // precio base del producto como respaldo.
    const unitPrice =
      typeof item.unitPrice === "number" && item.unitPrice >= 0
        ? item.unitPrice
        : product.price;
    total += unitPrice * quantity;
    return [
      {
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity,
        selectedOptions: item.selectedOptions || "",
      },
    ];
  });

  if (rowsToInsert.length === 0) {
    redirect(`/checkout?error=${encodeURIComponent("El carrito está vacío")}`);
  }

  const session = await getSession();

  // El pedido se crea como "pendiente" y sin descontar stock todavía.
  // El stock se descuenta recién cuando Mercado Pago confirma el pago
  // (ver src/app/api/mercadopago/webhook/route.ts), para no descontar
  // stock de compras abandonadas o rechazadas.
  const [order] = await db
    .insert(orders)
    .values({
      userId: session?.userId,
      customerName,
      customerEmail,
      customerPhone,
      address,
      total,
      status: "pendiente",
    })
    .returning();

  await db.insert(orderItems).values(
    rowsToInsert.map((row) => ({
      ...row,
      orderId: order.id,
    }))
  );

  const preferenceClient = getPreferenceClient();

  // Si no hay credenciales de Mercado Pago configuradas (MP_ACCESS_TOKEN en
  // .env), la tienda funciona con pago por transferencia bancaria: el
  // pedido queda "pendiente", sin descontar stock todavía, y en la página
  // de confirmación se le muestran al cliente los datos para transferir y
  // puede subir su comprobante. El stock se descuenta recién cuando el
  // admin aprueba el pedido (ver updateOrderStatusAction).
  if (!preferenceClient || !isMpConfigured()) {
    redirect(`/checkout/confirmacion/${order.id}`);
  }

  await db
    .update(orders)
    .set({ paymentMethod: "mercadopago" })
    .where(eq(orders.id, order.id));

  const appUrl = getAppUrl();
  const isHttps = appUrl.startsWith("https://");

  let checkoutUrl: string | null = null;

  try {
    const preference = await preferenceClient.create({
      body: {
        items: rowsToInsert.map((row) => ({
          id: String(row.productId),
          title: row.productName,
          quantity: row.quantity,
          currency_id: "CLP",
          unit_price: row.unitPrice,
        })),
        payer: {
          name: customerName,
          email: customerEmail,
        },
        external_reference: String(order.id),
        notification_url: `${appUrl}/api/mercadopago/webhook`,
        back_urls: {
          success: `${appUrl}/checkout/confirmacion/${order.id}`,
          pending: `${appUrl}/checkout/confirmacion/${order.id}`,
          failure: `${appUrl}/checkout/confirmacion/${order.id}`,
        },
        // auto_return solo funciona con una URL https pública (Mercado Pago
        // la rechaza en desarrollo local con http://localhost).
        ...(isHttps ? { auto_return: "approved" } : {}),
      },
    });

    await db
      .update(orders)
      .set({ mpPreferenceId: preference.id })
      .where(eq(orders.id, order.id));

    checkoutUrl =
      (process.env.NODE_ENV === "production"
        ? preference.init_point
        : preference.sandbox_init_point || preference.init_point) || null;
  } catch (err) {
    console.error("Error creando preferencia de Mercado Pago:", err);
  }

  if (!checkoutUrl) {
    redirect(
      `/checkout?error=${encodeURIComponent(
        "No se pudo iniciar el pago con Mercado Pago. Intenta nuevamente."
      )}`
    );
  }

  redirect(checkoutUrl);
}

// El cliente sube el comprobante de su transferencia desde la página de
// confirmación del pedido. No requiere sesión de admin: solo necesita
// conocer el número de pedido (nadie más lo ve).
export async function uploadPaymentProofAction(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const file = formData.get("proofFile");

  if (!orderId) {
    redirect(`/checkout?error=${encodeURIComponent("Pedido inválido")}`);
  }

  if (!(file instanceof File) || file.size === 0) {
    redirect(
      `/checkout/confirmacion/${orderId}?error=${encodeURIComponent(
        "Selecciona una imagen o PDF con tu comprobante"
      )}`
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    redirect(
      `/checkout/confirmacion/${orderId}?error=${encodeURIComponent(
        "El almacenamiento de archivos no está configurado. Contacta a la tienda."
      )}`
    );
  }

  const order = await db.query.orders.findFirst({
    where: (o, { eq: eqOp }) => eqOp(o.id, orderId),
  });
  if (!order) {
    redirect(`/checkout?error=${encodeURIComponent("Pedido no encontrado")}`);
  }

  const ext = file.name.split(".").pop() || "jpg";
  const key = `comprobantes/${orderId}-${Date.now()}.${ext}`;
  const blob = await put(key, file, { access: "public" });

  await db
    .update(orders)
    .set({ paymentProofUrl: blob.url })
    .where(eq(orders.id, orderId));

  revalidatePath(`/checkout/confirmacion/${orderId}`);
  revalidatePath("/admin/pedidos");
  redirect(`/checkout/confirmacion/${orderId}?comprobante=1`);
}
