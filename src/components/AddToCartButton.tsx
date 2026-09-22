"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";

type Props = {
  productId: number;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  stock: number;
  hasOptions?: boolean;
};

export default function AddToCartButton({
  productId,
  name,
  slug,
  price,
  imageUrl,
  stock,
  hasOptions,
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

  // Los productos con opciones (RAM, disco, etc.) se agregan desde su
  // propia página, donde se eligen esas opciones antes del precio final.
  if (hasOptions) {
    return (
      <Link
        href={`/productos/${slug}`}
        className="block w-full rounded-full bg-[#2563eb] px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
      >
        Elegir opciones
      </Link>
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
