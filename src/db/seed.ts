import "dotenv/config";
import { db } from "./index";
import { categories, products, services, users } from "./schema";
import { hashPassword } from "../lib/auth";
import { slugify } from "../lib/format";

async function main() {
  console.log("Sembrando datos de ejemplo...");

  // ---- Usuario admin ----
  const adminEmail = process.env.ADMIN_EMAIL || "admin@tienda.cl";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin1234";
  const existingAdmin = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, adminEmail),
  });
  if (!existingAdmin) {
    await db.insert(users).values({
      name: "Administrador",
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      role: "admin",
    });
    console.log(`Usuario admin creado: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log("Usuario admin ya existe, se omite.");
  }

  // ---- Categorías ----
  const categoryNames = ["Notebooks", "PC de Escritorio", "Equipos Gamers"];
  const categoryIds: Record<string, number> = {};
  for (const name of categoryNames) {
    const slug = slugify(name);
    const existing = await db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.slug, slug),
    });
    if (existing) {
      categoryIds[name] = existing.id;
      continue;
    }
    const [row] = await db
      .insert(categories)
      .values({ name, slug })
      .returning();
    categoryIds[name] = row.id;
  }

  // ---- Productos ----
  // Sin productos de ejemplo: agrega los tuyos desde /admin/productos/nuevo
  // (ahí puedes subir una foto real de cada equipo).
  const sampleProducts: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string;
  }[] = [];

  for (const p of sampleProducts) {
    const slug = slugify(p.name);
    const existing = await db.query.products.findFirst({
      where: (row, { eq }) => eq(row.slug, slug),
    });
    if (existing) continue;
    await db.insert(products).values({
      name: p.name,
      slug,
      description: p.description,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl,
      categoryId: categoryIds[p.category],
      active: true,
    });
  }

  // ---- Servicios ----
  const sampleServices = [
    {
      name: "Formateo e instalación de sistema operativo",
      description:
        "Formateo completo, instalación de Windows y controladores, respaldo de tus archivos.",
      price: 15990,
      durationMinutes: 60,
    },
    {
      name: "Armado de PC a pedido",
      description:
        "Armamos tu equipo con las piezas que elijas, con pruebas de estabilidad incluidas.",
      price: 29990,
      durationMinutes: 90,
    },
    {
      name: "Mantención y limpieza de equipo",
      description:
        "Limpieza interna, cambio de pasta térmica y revisión general de rendimiento.",
      price: 12990,
      durationMinutes: 45,
    },
  ];

  for (const s of sampleServices) {
    const slug = slugify(s.name);
    const existing = await db.query.services.findFirst({
      where: (row, { eq }) => eq(row.slug, slug),
    });
    if (existing) continue;
    await db.insert(services).values({
      name: s.name,
      slug,
      description: s.description,
      price: s.price,
      durationMinutes: s.durationMinutes,
      active: true,
    });
  }

  console.log("Listo.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
