"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { db } from "@/db";
import {
  products,
  services,
  categories,
  orders,
  bookings,
  productOptions,
  productOptionValues,
  productImages,
  siteSettings,
} from "@/db/schema";
import {
  productSchema,
  serviceSchema,
  productOptionSchema,
  productOptionValueSchema,
  siteSettingsSchema,
} from "@/lib/validators";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/format";
import { sendReceiptEmail } from "@/lib/email";

// Si el admin sube un archivo de imagen, lo guarda en Vercel Blob y
// devuelve su URL pública. Si no subió nada (o el almacenamiento no está
// configurado), devuelve null y se usa la URL manual del formulario.
async function uploadImageIfPresent(formData: FormData) {
  const file = formData.get("imageFile");
  if (!(file instanceof File) || file.size === 0) return null;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "El almacenamiento de imágenes no está configurado (falta BLOB_READ_WRITE_TOKEN). Revisa el README."
    );
  }

  const ext = file.name.split(".").pop() || "jpg";
  const key = `productos-servicios/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const blob = await put(key, file, { access: "public" });
  return blob.url;
}

const MAX_PRODUCT_IMAGES = 5;

// Igual que uploadImageIfPresent, pero para varios archivos a la vez (la
// galería de fotos de un producto). Ignora archivos vacíos y devuelve las
// URLs públicas en el mismo orden en que se subieron.
async function uploadImagesIfPresent(formData: FormData, fieldName: string) {
  const files = formData
    .getAll(fieldName)
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return [];

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "El almacenamiento de imágenes no está configurado (falta BLOB_READ_WRITE_TOKEN). Revisa el README."
    );
  }

  const urls: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg";
    const key = `productos-servicios/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const blob = await put(key, file, { access: "public" });
    urls.push(blob.url);
  }
  return urls;
}

async function resolveCategoryId(categoryName: string) {
  if (!categoryName.trim()) return null;
  const slug = slugify(categoryName);
  const existing = await db.query.categories.findFirst({
    where: (c, { eq: eqOp }) => eqOp(c.slug, slug),
  });
  if (existing) return existing.id;
  const [row] = await db
    .insert(categories)
    .values({ name: categoryName, slug })
    .returning();
  return row.id;
}

async function uniqueSlug(base: string, excludeId?: number) {
  let slug = slugify(base) || "producto";
  let n = 1;
  while (true) {
    const existing = await db.query.products.findFirst({
      where: (p, { eq: eqOp }) => eqOp(p.slug, slug),
    });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

async function uniqueServiceSlug(base: string, excludeId?: number) {
  let slug = slugify(base) || "servicio";
  let n = 1;
  while (true) {
    const existing = await db.query.services.findFirst({
      where: (s, { eq: eqOp }) => eqOp(s.slug, slug),
    });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

// ---------- Productos ----------

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  let coverUpload: string | null = null;
  let galleryUrls: string[] = [];
  try {
    coverUpload = await uploadImageIfPresent(formData);
    galleryUrls = await uploadImagesIfPresent(formData, "galleryFiles");
  } catch (err) {
    redirect(
      `/admin/productos/nuevo?error=${encodeURIComponent(
        err instanceof Error ? err.message : "No se pudo subir la imagen"
      )}`
    );
  }

  const manualUrl = formData.get("imageUrl")?.toString().trim() || "";
  const coverUrl = coverUpload || manualUrl;

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    imageUrl: coverUrl,
    categoryName: formData.get("categoryName"),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    redirect(
      `/admin/productos/nuevo?error=${encodeURIComponent(
        parsed.error.issues[0]?.message || "Datos inválidos"
      )}`
    );
  }

  const { categoryName, ...data } = parsed.data;
  const categoryId = await resolveCategoryId(categoryName);
  const slug = await uniqueSlug(data.name);

  const [product] = await db
    .insert(products)
    .values({ ...data, slug, categoryId })
    .returning();

  // La galería es aparte de la portada: son las fotos adicionales del
  // producto (hasta 5), no incluye la foto de portada.
  if (galleryUrls.length > 0) {
    await db.insert(productImages).values(
      galleryUrls.slice(0, MAX_PRODUCT_IMAGES).map((url, i) => ({
        productId: product.id,
        url,
        sortOrder: i,
      }))
    );
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  redirect("/admin/productos");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));

  let coverUpload: string | null = null;
  let galleryUrls: string[] = [];
  try {
    coverUpload = await uploadImageIfPresent(formData);
    galleryUrls = await uploadImagesIfPresent(formData, "galleryFiles");
  } catch (err) {
    redirect(
      `/admin/productos/${id}?error=${encodeURIComponent(
        err instanceof Error ? err.message : "No se pudo subir la imagen"
      )}`
    );
  }

  const manualUrl = formData.get("imageUrl")?.toString().trim() || "";
  const coverUrl = coverUpload || manualUrl;

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    imageUrl: coverUrl,
    categoryName: formData.get("categoryName"),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    redirect(
      `/admin/productos/${id}?error=${encodeURIComponent(
        parsed.error.issues[0]?.message || "Datos inválidos"
      )}`
    );
  }

  const { categoryName, ...data } = parsed.data;
  const categoryId = await resolveCategoryId(categoryName);

  await db
    .update(products)
    .set({ ...data, categoryId })
    .where(eq(products.id, id));

  // La galería es aparte de la portada: son fotos adicionales (hasta 5).
  if (galleryUrls.length > 0) {
    const existingImages = await db.query.productImages.findMany({
      where: (pi, { eq: eqOp }) => eqOp(pi.productId, id),
    });
    const remainingSlots = Math.max(MAX_PRODUCT_IMAGES - existingImages.length, 0);
    const toInsert = galleryUrls.slice(0, remainingSlots);
    if (toInsert.length > 0) {
      await db.insert(productImages).values(
        toInsert.map((url, i) => ({
          productId: id,
          url,
          sortOrder: existingImages.length + i,
        }))
      );
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  redirect("/admin/productos");
}

export async function deleteProductImageAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const productId = Number(formData.get("productId"));
  await db.delete(productImages).where(eq(productImages.id, id));
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/productos");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}

// ---------- Servicios ----------

export async function createServiceAction(formData: FormData) {
  await requireAdmin();

  let uploadedUrl: string | null = null;
  try {
    uploadedUrl = await uploadImageIfPresent(formData);
  } catch (err) {
    redirect(
      `/admin/servicios/nuevo?error=${encodeURIComponent(
        err instanceof Error ? err.message : "No se pudo subir la imagen"
      )}`
    );
  }

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    durationMinutes: formData.get("durationMinutes"),
    imageUrl: uploadedUrl || formData.get("imageUrl"),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    redirect(
      `/admin/servicios/nuevo?error=${encodeURIComponent(
        parsed.error.issues[0]?.message || "Datos inválidos"
      )}`
    );
  }

  const slug = await uniqueServiceSlug(parsed.data.name);
  await db.insert(services).values({ ...parsed.data, slug });

  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
  redirect("/admin/servicios");
}

export async function updateServiceAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));

  let uploadedUrl: string | null = null;
  try {
    uploadedUrl = await uploadImageIfPresent(formData);
  } catch (err) {
    redirect(
      `/admin/servicios/${id}?error=${encodeURIComponent(
        err instanceof Error ? err.message : "No se pudo subir la imagen"
      )}`
    );
  }

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    durationMinutes: formData.get("durationMinutes"),
    imageUrl: uploadedUrl || formData.get("imageUrl"),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    redirect(
      `/admin/servicios/${id}?error=${encodeURIComponent(
        parsed.error.issues[0]?.message || "Datos inválidos"
      )}`
    );
  }

  await db.update(services).set(parsed.data).where(eq(services.id, id));

  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
  redirect("/admin/servicios");
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(services).where(eq(services.id, id));
  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
}

// ---------- Opciones de producto (RAM, disco, procesador, color, etc.) ----------

export async function createProductOptionAction(formData: FormData) {
  await requireAdmin();
  const productId = Number(formData.get("productId"));

  const parsed = productOptionSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    redirect(
      `/admin/productos/${productId}?error=${encodeURIComponent(
        parsed.error.issues[0]?.message || "Datos inválidos"
      )}`
    );
  }

  await db.insert(productOptions).values({
    productId,
    name: parsed.data.name,
  });

  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/productos");
  redirect(`/admin/productos/${productId}`);
}

export async function deleteProductOptionAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const productId = Number(formData.get("productId"));
  await db.delete(productOptions).where(eq(productOptions.id, id));
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/productos");
}

export async function createProductOptionValueAction(formData: FormData) {
  await requireAdmin();
  const optionId = Number(formData.get("optionId"));
  const productId = Number(formData.get("productId"));

  const parsed = productOptionValueSchema.safeParse({
    label: formData.get("label"),
    priceDelta: formData.get("priceDelta"),
  });
  if (!parsed.success) {
    redirect(
      `/admin/productos/${productId}?error=${encodeURIComponent(
        parsed.error.issues[0]?.message || "Datos inválidos"
      )}`
    );
  }

  await db.insert(productOptionValues).values({
    optionId,
    label: parsed.data.label,
    priceDelta: parsed.data.priceDelta,
  });

  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/productos");
  redirect(`/admin/productos/${productId}`);
}

export async function deleteProductOptionValueAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const productId = Number(formData.get("productId"));
  await db.delete(productOptionValues).where(eq(productOptionValues.id, id));
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/productos");
}

// ---------- Configuración del home ----------

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin();

  let uploadedUrl: string | null = null;
  try {
    uploadedUrl = await uploadImageIfPresent(formData);
  } catch (err) {
    redirect(
      `/admin/inicio?error=${encodeURIComponent(
        err instanceof Error ? err.message : "No se pudo subir la imagen"
      )}`
    );
  }

  const parsed = siteSettingsSchema.safeParse({
    heroTitle: formData.get("heroTitle"),
    heroSubtitle: formData.get("heroSubtitle"),
    heroImageUrl: uploadedUrl || formData.get("heroImageUrl"),
    bannerEnabled: formData.get("bannerEnabled") === "on",
    bannerText: formData.get("bannerText"),
    showFeaturedProducts: formData.get("showFeaturedProducts") === "on",
    showFeaturedServices: formData.get("showFeaturedServices") === "on",
    featuredProductsCount: formData.get("featuredProductsCount"),
    featuredServicesCount: formData.get("featuredServicesCount"),
    transferBankName: formData.get("transferBankName"),
    transferAccountType: formData.get("transferAccountType"),
    transferAccountNumber: formData.get("transferAccountNumber"),
    transferHolderName: formData.get("transferHolderName"),
    transferHolderRut: formData.get("transferHolderRut"),
    transferEmail: formData.get("transferEmail"),
    footerAddress: formData.get("footerAddress"),
    footerReturnPolicy: formData.get("footerReturnPolicy"),
    footerInstagramUrl: formData.get("footerInstagramUrl"),
    footerFacebookUrl: formData.get("footerFacebookUrl"),
    footerWhatsappUrl: formData.get("footerWhatsappUrl"),
    footerTiktokUrl: formData.get("footerTiktokUrl"),
  });

  if (!parsed.success) {
    redirect(
      `/admin/inicio?error=${encodeURIComponent(
        parsed.error.issues[0]?.message || "Datos inválidos"
      )}`
    );
  }

  const existing = await db.query.siteSettings.findFirst();
  if (existing) {
    await db
      .update(siteSettings)
      .set(parsed.data)
      .where(eq(siteSettings.id, existing.id));
  } else {
    await db.insert(siteSettings).values(parsed.data);
  }

  revalidatePath("/admin/inicio");
  revalidatePath("/");
  redirect("/admin/inicio?ok=1");
}

// ---------- Pedidos ----------

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = formData.get("status") as
    | "pendiente"
    | "pagado"
    | "enviado"
    | "entregado"
    | "cancelado";

  const order = await db.query.orders.findFirst({
    where: (o, { eq: eqOp }) => eqOp(o.id, id),
    with: { items: true },
  });

  const wasAlreadyPaid = order?.status === "pagado";

  await db.update(orders).set({ status }).where(eq(orders.id, id));

  // Al aprobar un pedido por transferencia (pasa a "pagado" por primera
  // vez), descontamos el stock recién en este momento y le mandamos al
  // cliente su comprobante de compra por correo.
  if (order && status === "pagado" && !wasAlreadyPaid) {
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

    if (order.paymentMethod === "transferencia") {
      const sent = await sendReceiptEmail({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total,
        items: order.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          selectedOptions: i.selectedOptions,
        })),
      });
      if (sent) {
        await db
          .update(orders)
          .set({ receiptSentAt: new Date() })
          .where(eq(orders.id, id));
      }
    }
  }

  revalidatePath("/admin/pedidos");
}

// ---------- Reservas ----------

export async function updateBookingStatusAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = formData.get("status") as
    | "pendiente"
    | "confirmada"
    | "cancelada"
    | "completada";
  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  revalidatePath("/admin/reservas");
}
