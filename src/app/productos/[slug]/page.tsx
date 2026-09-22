import { notFound } from "next/navigation";
import { db } from "@/db";
import ProductPurchaseBox from "@/components/ProductPurchaseBox";
import ProductGallery from "@/components/ProductGallery";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.slug, slug),
    with: {
      options: {
        orderBy: (o, { asc }) => asc(o.sortOrder),
        with: {
          values: { orderBy: (v, { asc }) => asc(v.sortOrder) },
        },
      },
      images: {
        orderBy: (pi, { asc }) => asc(pi.sortOrder),
      },
    },
  });

  if (!product || !product.active) notFound();

  const galleryImages =
    product.images.length > 0
      ? product.images.map((img) => img.url)
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <ProductGallery name={product.name} images={galleryImages} />
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="whitespace-pre-line text-black/70 dark:text-white/70">
          {product.description || "Sin descripción."}
        </p>
        <p className="text-sm text-black/50 dark:text-white/50">
          {product.stock > 0
            ? `${product.stock} unidades disponibles`
            : "Sin stock por el momento"}
        </p>
        <div className="max-w-xs pt-2">
          <ProductPurchaseBox
            productId={product.id}
            name={product.name}
            slug={product.slug}
            basePrice={product.price}
            imageUrl={product.imageUrl}
            stock={product.stock}
            options={product.options}
          />
        </div>
      </div>
    </div>
  );
}
