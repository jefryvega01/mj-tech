import { db } from "@/db";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Productos · Mi Tienda" };

export default async function ProductsPage() {
  const items = await db.query.products.findMany({
    where: (p, { eq }) => eq(p.active, true),
    orderBy: (p, { desc }) => desc(p.createdAt),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Productos</h1>
      {items.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          Todavía no hay productos publicados.
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
