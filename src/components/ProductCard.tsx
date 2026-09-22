import Link from "next/link";
import { formatCLP } from "@/lib/format";
import type { Product } from "@/db/schema";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-black/10 transition-colors hover:border-[#2563eb]/40 dark:border-white/10 dark:hover:border-[#38bdf8]/40">
      <Link
        href={`/productos/${product.slug}`}
        className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#eff8ff] to-[#e0f2fe] text-3xl dark:from-[#0c1c2e] dark:to-[#0a1522]"
      >
        📦
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/productos/${product.slug}`} className="font-medium hover:underline">
          {product.name}
        </Link>
        <p className="text-sm font-semibold">{formatCLP(product.price)}</p>
        <div className="mt-auto pt-2">
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
