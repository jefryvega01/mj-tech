"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  products,
  services,
  categories,
  orders,
  bookings,
} from "@/db/schema";
import { productSchema, serviceSchema } from "@/lib/validators";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/format";

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

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl"),
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

  await db.insert(products).values({ ...data, slug, categoryId });

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  redirect("/admin/productos");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl"),
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

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  redirect("/admin/productos");
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

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    durationMinutes: formData.get("durationMinutes"),
    imageUrl: formData.get("imageUrl"),
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
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    durationMinutes: formData.get("durationMinutes"),
    imageUrl: formData.get("imageUrl"),
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
  await db.update(orders).set({ status }).where(eq(orders.id, id));
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
