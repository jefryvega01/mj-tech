"use client";

import { useMemo, useState } from "react";
import { formatCLP } from "@/lib/format";
import { useCart } from "./CartContext";

type OptionValue = { id: number; label: string; priceDelta: number };
type Option = { id: number; name: string; values: OptionValue[] };

type Props = {
  productId: number;
  name: string;
  slug: string;
  basePrice: number;
  imageUrl: string;
  stock: number;
  options: Option[];
};

export default function ProductPurchaseBox({
  productId,
  name,
  slug,
  basePrice,
  imageUrl,
  stock,
  options,
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const [selected, setSelected] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    for (const opt of options) {
      if (opt.values[0]) initial[opt.id] = opt.values[0].id;
    }
    return initial;
  });

  const selectedValues = useMemo(
    () =>
      options.map((opt) => {
        const value =
          opt.values.find((v) => v.id === selected[opt.id]) || opt.values[0];
        return { option: opt, value };
      }),
    [options, selected]
  );

  const totalPrice =
    basePrice +
    selectedValues.reduce((sum, { value }) => sum + (value?.priceDelta || 0), 0);

  if (stock <= 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xl font-semibold">{formatCLP(basePrice)}</p>
        <button
          type="button"
          disabled
          className="w-full rounded-full bg-black/10 px-4 py-2 text-sm font-medium text-black/40 dark:bg-white/10 dark:text-white/40"
        >
          Sin stock
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {options.length > 0 && (
        <div className="flex flex-col gap-3">
          {options.map((opt) => (
            <label key={opt.id} className="flex flex-col gap-1 text-sm">
              {opt.name}
              <select
                value={selected[opt.id] ?? ""}
                onChange={(e) =>
                  setSelected((prev) => ({
                    ...prev,
                    [opt.id]: Number(e.target.value),
                  }))
                }
                className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              >
                {opt.values.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                    {v.priceDelta !== 0
                      ? ` (${v.priceDelta > 0 ? "+" : ""}${formatCLP(v.priceDelta)})`
                      : ""}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}

      <p className="text-xl font-semibold">{formatCLP(totalPrice)}</p>

      <button
        type="button"
        onClick={() => {
          addItem({
            productId,
            name,
            slug,
            price: totalPrice,
            imageUrl,
            selectedOptions: selectedValues
              .filter(({ value }) => value)
              .map(({ option, value }) => ({
                optionName: option.name,
                valueLabel: value.label,
                priceDelta: value.priceDelta,
              })),
          });
          setAdded(true);
          setTimeout(() => setAdded(false), 1200);
        }}
        className="w-full rounded-full bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
      >
        {added ? "Agregado ✓" : "Agregar al carrito"}
      </button>
    </div>
  );
}
