"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatCLP } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">Tu carrito está vacío</p>
        <Link
          href="/productos"
          className="rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Tu carrito</h1>

      <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 py-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#eff8ff] to-[#e0f2fe] text-2xl dark:from-[#0c1c2e] dark:to-[#0a1522]">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                "📦"
              )}
            </div>
            <div className="flex-1">
              <Link href={`/productos/${item.slug}`} className="font-medium hover:underline">
                {item.name}
              </Link>
              <p className="text-sm text-black/50 dark:text-white/50">
                {formatCLP(item.price)} c/u
              </p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(item.productId, Number(e.target.value) || 1)
              }
              className="w-16 rounded-lg border border-black/15 px-2 py-1 text-center dark:border-white/20 dark:bg-transparent"
            />
            <p className="w-24 text-right font-medium">
              {formatCLP(item.price * item.quantity)}
            </p>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-black/40 hover:text-red-600 dark:text-white/40"
              aria-label="Quitar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-lg font-semibold">{formatCLP(totalPrice)}</span>
      </div>

      <Link
        href="/checkout"
        className="self-end rounded-full bg-[#2563eb] px-6 py-3 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
      >
        Continuar al pago
      </Link>
    </div>
  );
}
