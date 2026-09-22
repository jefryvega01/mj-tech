"use client";

import { useState } from "react";
import { useCart } from "./CartContext";

type Props = {
  productId: number;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  stock: number;
};

export default function AddToCartButton({
  productId,
  name,
  slug,
  price,
  imageUrl,
  stock,
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (stock <= 0) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-full bg-black/10 px-4 py-2 text-sm font-medium text-black/40 dark:bg-white/10 dark:text-white/40"
      >
        Sin stock
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        addItem({ productId, name, slug, price, imageUrl });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className="w-full rounded-full bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
    >
      {added ? "Agregado ✓" : "Agregar al carrito"}
    </button>
  );
}
