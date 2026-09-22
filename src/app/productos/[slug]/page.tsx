import { notFound } from "next/navigation";
import { db } from "@/db";
import { formatCLP } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.slug, slug),
  });

  if (!product || !product.active) notFound();

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#eff8ff] to-[#e0f2fe] text-6xl dark:from-[#0c1c2e] dark:to-[#0a1522]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          "📦"
        )}
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-xl font-semibold">{formatCLP(product.price)}</p>
        <p className="whitespace-pre-line text-black/70 dark:text-white/70">
          {product.description || "Sin descripción."}
        </p>
        <p className="text-sm text-black/50 dark:text-white/50">
          {product.stock > 0
            ? `${product.stock} unidades disponibles`
            : "Sin stock por el momento"}
        </p>
        <div className="max-w-xs pt-2">
          <AddToCartButton
            productId={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            imageUrl={product.imageUrl}
            stock={product.stock}
          />
        </div>
      </div>
    </div>
  );
}
