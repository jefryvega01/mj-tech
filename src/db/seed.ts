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
  const categoryNames = ["Neumáticos", "Repuestos", "Accesorios"];
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
  const sampleProducts = [
    {
      name: "Neumático 195/65 R15",
      description:
        "Neumático radial para uso urbano, excelente agarre en seco y mojado.",
      price: 79990,
      stock: 24,
      category: "Neumáticos",
      imageUrl: "",
    },
    {
      name: "Neumático 205/55 R16",
      description: "Ideal para sedanes medianos, baja resistencia a la rodadura.",
      price: 94990,
      stock: 18,
      category: "Neumáticos",
      imageUrl: "",
    },
    {
      name: "Filtro de aceite",
      description: "Filtro de aceite de alta calidad, compatible con la mayoría de vehículos livianos.",
      price: 8990,
      stock: 60,
      category: "Repuestos",
      imageUrl: "",
    },
    {
      name: "Pastillas de freno (juego)",
      description: "Juego de pastillas de freno delanteras, cerámicas de bajo ruido.",
      price: 34990,
      stock: 30,
      category: "Repuestos",
      imageUrl: "",
    },
    {
      name: "Tapa de llanta universal",
      description: "Set de 4 tapas de llanta, ajuste universal.",
      price: 12990,
      stock: 40,
      category: "Accesorios",
      imageUrl: "",
    },
  ];

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
      name: "Instalación y balanceo de neumáticos",
      description: "Montaje, balanceo y alineación básica incluidos.",
      price: 14990,
      durationMinutes: 45,
    },
    {
      name: "Cambio de aceite y filtro",
      description: "Cambio de aceite de motor y filtro, revisión de niveles.",
      price: 24990,
      durationMinutes: 40,
    },
    {
      name: "Revisión de frenos",
      description: "Diagnóstico y revisión del sistema de frenos completo.",
      price: 12990,
      durationMinutes: 30,
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
