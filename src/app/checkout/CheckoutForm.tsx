"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { formatCLP } from "@/lib/format";
import { createOrderAction } from "@/app/actions/checkout";

export default function CheckoutForm({
  mpConfigured,
}: {
  mpConfigured: boolean;
}) {
  const { items, totalPrice } = useCart();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

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
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Finalizar compra</h1>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <form action={createOrderAction} className="flex flex-col gap-3">
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(
              items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                unitPrice: i.price,
                selectedOptions: (i.selectedOptions ?? [])
                  .map((o) => `${o.optionName}: ${o.valueLabel}`)
                  .join(", "),
              }))
            )}
          />

          <label className="flex flex-col gap-1 text-sm">
            Nombre completo
            <input
              name="customerName"
              required
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Correo electrónico
            <input
              type="email"
              name="customerEmail"
              required
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Teléfono
            <input
              name="customerPhone"
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Dirección de despacho
            <textarea
              name="address"
              required
              rows={3}
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>

          {mpConfigured ? (
            <p className="text-xs text-black/50 dark:text-white/50">
              Al confirmar serás redirigido a Mercado Pago para pagar de forma
              segura.
            </p>
          ) : (
            <p className="text-xs text-black/50 dark:text-white/50">
              El pago con Mercado Pago todavía no está configurado; el pedido
              quedará registrado como pendiente de pago.
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
          >
            {mpConfigured ? "Ir a pagar" : "Confirmar pedido"}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-lg font-semibold">Resumen</h2>
        <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
          {items.map((item) => (
            <div key={item.cartKey} className="flex flex-col gap-0.5 py-2 text-sm">
              <div className="flex justify-between">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>{formatCLP(item.price * item.quantity)}</span>
              </div>
              {item.selectedOptions && item.selectedOptions.length > 0 && (
                <span className="text-xs text-black/50 dark:text-white/50">
                  {item.selectedOptions
                    .map((o) => `${o.optionName}: ${o.valueLabel}`)
                    .join(" · ")}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-black/10 pt-3 font-semibold dark:border-white/10">
          <span>Total</span>
          <span>{formatCLP(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
