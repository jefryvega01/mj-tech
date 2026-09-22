import Link from "next/link";
import { db } from "@/db";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";

export default async function HomePage() {
  const settings = await db.query.siteSettings.findFirst();

  const showFeaturedProducts = settings?.showFeaturedProducts ?? true;
  const showFeaturedServices = settings?.showFeaturedServices ?? true;

  const [featuredProducts, featuredServices] = await Promise.all([
    showFeaturedProducts
      ? db.query.products.findMany({
          where: (p, { eq }) => eq(p.active, true),
          limit: settings?.featuredProductsCount ?? 4,
          orderBy: (p, { desc }) => desc(p.createdAt),
          with: { options: { columns: { id: true } } },
        })
      : Promise.resolve([]),
    showFeaturedServices
      ? db.query.services.findMany({
          where: (s, { eq }) => eq(s.active, true),
          limit: settings?.featuredServicesCount ?? 3,
          orderBy: (s, { desc }) => desc(s.createdAt),
        })
      : Promise.resolve([]),
  ]);

  const heroTitle = settings?.heroTitle || "Todo lo que necesitas, en un solo lugar.";
  const heroSubtitle =
    settings?.heroSubtitle ||
    "Compra productos y agenda servicios sin salir de la página. Envíos rápidos y horas disponibles todos los días.";

  return (
    <div className="flex flex-col gap-16">
      {settings?.bannerEnabled && settings.bannerText && (
        <div className="brand-gradient-bg -mt-8 rounded-b-xl px-4 py-2 text-center text-sm font-medium text-white">
          {settings.bannerText}
        </div>
      )}

      <section className="flex flex-col items-start gap-4 overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-br from-[#eff8ff] to-white px-6 py-12 dark:border-white/10 dark:from-[#0c1c2e] dark:to-[#0a0f1a] sm:px-10">
        {settings?.heroImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.heroImageUrl}
            alt=""
            className="mb-2 max-h-40 rounded-xl object-cover"
          />
        )}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {heroTitle}
        </h1>
        <p className="max-w-xl text-black/60 dark:text-white/60">
          {heroSubtitle}
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

      {showFeaturedProducts && featuredProducts.length > 0 && (
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

      {showFeaturedServices && featuredServices.length > 0 && (
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
