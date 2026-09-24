import Link from "next/link";
import { db } from "@/db";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Productos · MJ Tech" };

function pillClass(active: boolean) {
  return active
    ? "rounded-full border border-[#2563eb] bg-[#2563eb] px-3 py-1.5 text-sm font-medium text-white dark:border-[#38bdf8] dark:bg-[#38bdf8] dark:text-[#04141f]"
    : "rounded-full border border-black/15 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q, categoria } = await searchParams;
  const search = (q || "").trim();

  const categories = await db.query.categories.findMany({
    orderBy: (c, { asc }) => asc(c.name),
  });

  const activeCategory = categoria
    ? categories.find((c) => c.slug === categoria)
    : undefined;

  const items = await db.query.products.findMany({
    where: (p, { eq, and, ilike }) =>
      and(
        eq(p.active, true),
        activeCategory ? eq(p.categoryId, activeCategory.id) : undefined,
        search ? ilike(p.name, `%${search}%`) : undefined
      ),
    orderBy: (p, { desc }) => desc(p.createdAt),
    with: { options: { columns: { id: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Productos</h1>

      <form
        method="get"
        action="/productos"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Buscar productos..."
          className="w-full max-w-sm rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
        {activeCategory && (
          <input type="hidden" name="categoria" value={activeCategory.slug} />
        )}
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={search ? `/productos?q=${encodeURIComponent(search)}` : "/productos"}
            className={pillClass(!activeCategory)}
          >
            Todas
          </Link>
          {categories.map((c) => {
            const params = new URLSearchParams();
            params.set("categoria", c.slug);
            if (search) params.set("q", search);
            return (
              <Link
                key={c.id}
                href={`/productos?${params.toString()}`}
                className={pillClass(activeCategory?.id === c.id)}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          {search || activeCategory
            ? "No encontramos productos que coincidan con tu búsqueda."
            : "Todavía no hay productos publicados."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
