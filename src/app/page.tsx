import Link from "next/link";
import { db } from "@/db";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";

export default async function HomePage() {
  const [featuredProducts, featuredServices] = await Promise.all([
    db.query.products.findMany({
      where: (p, { eq }) => eq(p.active, true),
      limit: 4,
      orderBy: (p, { desc }) => desc(p.createdAt),
    }),
    db.query.services.findMany({
      where: (s, { eq }) => eq(s.active, true),
      limit: 3,
      orderBy: (s, { desc }) => desc(s.createdAt),
    }),
  ]);

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-start gap-4 rounded-3xl border border-black/5 bg-gradient-to-br from-[#eff8ff] to-white px-6 py-12 dark:border-white/10 dark:from-[#0c1c2e] dark:to-[#0a0f1a] sm:px-10">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="brand-gradient-text">Todo lo que necesitas</span>,
          en un solo lugar.
        </h1>
        <p className="max-w-xl text-black/60 dark:text-white/60">
          Compra productos y agenda servicios sin salir de la página. Envíos
          rápidos y horas disponibles todos los días.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/productos"
            className="rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-600/20 hover:bg-[#1d4ed8] dark:bg-[#38bdf8] dark:text-[#04141f] dark:hover:bg-[#22d3ee]"
          >
            Ver productos
          </Link>
          <Link
            href="/servicios"
            className="rounded-full border border-black/15 bg-white/60 px-5 py-2.5 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:bg-transparent dark:hover:bg-white/10"
          >
            Ver servicios
          </Link>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Productos destacados</h2>
            <Link href="/productos" className="text-sm hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {featuredServices.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Servicios</h2>
            <Link href="/servicios" className="text-sm hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
