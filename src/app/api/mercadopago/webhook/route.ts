import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import {
  getPaymentClient,
  mapPaymentStatusToOrderStatus,
} from "@/lib/mercadopago";
import {
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
} from "mercadopago";

// Mercado Pago espera una respuesta rápida (200/201). Si no configuramos
// credenciales, igual respondemos 200 para que Mercado Pago no siga
// reintentando indefinidamente.
export async function POST(request: NextRequest) {
  const paymentClient = getPaymentClient();
  if (!paymentClient) {
    return NextResponse.json({ received: true, skipped: "not-configured" });
  }

  const url = request.nextUrl;
  const dataIdFromQuery = url.searchParams.get("data.id") || url.searchParams.get("id");

  let body: {
    type?: string;
    topic?: string;
    action?: string;
    data?: { id?: string };
  } = {};
  try {
    body = await request.json();
  } catch {
    // algunas notificaciones antiguas (topic=merchant_order) no traen body JSON
  }

  const type = body.type || body.topic;
  const paymentId = body.data?.id || dataIdFromQuery;

  // Solo nos interesan las notificaciones de pago.
  if (type !== "payment" || !paymentId) {
    return NextResponse.json({ received: true, ignored: type || "unknown" });
  }

  const secret = process.env.MP_WEBHOOK_SECRET?.trim();
  if (secret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId: dataIdFromQuery,
        secret,
        toleranceSeconds: 300,
      });
    } catch (err) {
      if (err instanceof InvalidWebhookSignatureError) {
        console.error("Firma de webhook de Mercado Pago inválida:", err.reason);
        return NextResponse.json({ error: "invalid signature" }, { status: 401 });
      }
      throw err;
    }
  } else {
    console.warn(
      "MP_WEBHOOK_SECRET no está configurado: no se pudo verificar la firma del webhook."
    );
  }

  let payment: Awaited<ReturnType<typeof paymentClient.get>>;
  try {
    payment = await paymentClient.get({ id: paymentId });
  } catch (err) {
    // No pudimos consultar el pago en la API de Mercado Pago (credenciales
    // inválidas, corte de red, etc.). Devolvemos un error para que Mercado
    // Pago reintente el envío del webhook más tarde.
    console.error("Error consultando el pago en Mercado Pago:", err);
    return NextResponse.json({ error: "no se pudo consultar el pago" }, { status: 502 });
  }

  const orderId = Number(payment.external_reference);
  if (!orderId) {
    return NextResponse.json({ received: true, warning: "sin external_reference" });
  }

  const order = await db.query.orders.findFirst({
    where: (o, { eq: eqOp }) => eqOp(o.id, orderId),
    with: { items: true },
  });
  if (!order) {
    return NextResponse.json({ received: true, warning: "pedido no encontrado" });
  }

  const newStatus = mapPaymentStatusToOrderStatus(payment.status);
  const wasAlreadyPaid = order.status === "pagado";

  await db
    .update(orders)
    .set({
      status: newStatus,
      mpPaymentId: String(payment.id),
      mpStatusDetail: payment.status_detail || null,
    })
    .where(eq(orders.id, order.id));

  // Descontamos stock solo la primera vez que el pago queda aprobado,
  // para no descontarlo dos veces si Mercado Pago reenvía la notificación.
  if (newStatus === "pagado" && !wasAlreadyPaid) {
    for (const item of order.items) {
      const product = await db.query.products.findFirst({
        where: (p, { eq: eqOp }) => eqOp(p.id, item.productId),
      });
      if (!product) continue;
      const newStock = Math.max(product.stock - item.quantity, 0);
      await db
        .update(products)
        .set({ stock: newStock })
        .where(eq(products.id, product.id));
    }
  }

  return NextResponse.json({ received: true });
}

// Mercado Pago a veces hace una verificación inicial con GET.
export async function GET() {
  return NextResponse.json({ ok: true });
}
