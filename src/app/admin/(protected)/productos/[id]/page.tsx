import { notFound } from "next/navigation";
import { db } from "@/db";
import { formatCLP } from "@/lib/format";
import {
  updateProductAction,
  createProductOptionAction,
  deleteProductOptionAction,
  createProductOptionValueAction,
  deleteProductOptionValueAction,
  deleteProductImageAction,
} from "@/app/actions/admin";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const productId = Number(id);

  const product = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.id, productId),
    with: {
      category: true,
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

  if (!product) notFound();
  const remainingImageSlots = Math.max(5 - product.images.length, 0);

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">Editar producto</h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form
        action={updateProductAction}
        encType="multipart/form-data"
        className="flex max-w-lg flex-col gap-3"
      >
        <input type="hidden" name="id" value={product.id} />

        {product.imageUrl && (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-black/50 dark:text-white/50">
              Portada actual
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-32 w-32 rounded-lg border border-black/10 object-cover dark:border-white/10"
            />
          </div>
        )}

        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            name="name"
            defaultValue={product.name}
            required
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Descripción
          <textarea
            name="description"
            rows={3}
            defaultValue={product.description}
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Precio (CLP)
            <input
              type="number"
              name="price"
              min={0}
              defaultValue={product.price}
              required
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Stock
            <input
              type="number"
              name="stock"
              min={0}
              defaultValue={product.stock}
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Categoría
          <input
            name="categoryName"
            defaultValue={product.category?.name || ""}
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Cambiar portada (opcional)
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            className="rounded-lg border border-black/15 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          … o URL de imagen para la portada
          <input
            name="imageUrl"
            defaultValue={product.imageUrl}
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {remainingImageSlots > 0
            ? `Agregar otras fotos (opcional, hasta ${remainingImageSlots} más)`
            : "Ya tienes el máximo de 5 fotos adicionales"}
          <input
            type="file"
            name="galleryFiles"
            accept="image/*"
            multiple
            disabled={remainingImageSlots === 0}
            className="rounded-lg border border-black/15 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white disabled:opacity-50 dark:border-white/20 dark:bg-transparent"
          />
          <span className="text-xs text-black/50 dark:text-white/50">
            Estas se muestran aparte de la portada, como fotos adicionales del producto.
          </span>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product.active} />
          Producto activo (visible en la tienda)
        </label>

        <button
          type="submit"
          className="mt-2 self-start rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
        >
          Guardar cambios
        </button>
      </form>

      {product.images.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-black/10 pt-6 dark:border-white/10">
          <p className="text-sm font-medium">
            Fotos adicionales ({product.images.length}/5)
          </p>
          <div className="flex flex-wrap gap-3">
            {product.images.map((img) => (
              <div key={img.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={product.name}
                  className="h-24 w-24 rounded-lg border border-black/10 object-cover dark:border-white/10"
                />
                <form
                  action={deleteProductImageAction}
                  className="absolute -right-2 -top-2"
                >
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    title="Quitar foto"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow hover:bg-red-700"
                  >
                    ×
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-black/10 pt-6 dark:border-white/10">
        <div>
          <h2 className="text-lg font-semibold">Variaciones</h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            Crea grupos de opciones (RAM, disco duro, procesador, color, etc.)
            y sus valores. Cada valor puede sumar o restar del precio base.
          </p>
        </div>

        {product.options.length === 0 && (
          <p className="text-sm text-black/50 dark:text-white/50">
            Este producto todavía no tiene variaciones.
          </p>
        )}

        {product.options.map((option) => (
          <div
            key={option.id}
            className="flex flex-col gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{option.name}</h3>
              <form action={deleteProductOptionAction}>
                <input type="hidden" name="id" value={option.id} />
                <input type="hidden" name="productId" value={product.id} />
                <button
                  type="submit"
                  className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                >
                  Eliminar grupo
                </button>
              </form>
            </div>

            <div className="flex flex-col gap-2">
              {option.values.map((value) => (
                <div
                  key={value.id}
                  className="flex items-center justify-between rounded-lg bg-black/5 px-3 py-2 text-sm dark:bg-white/10"
                >
                  <span>
                    {value.label}
                    {value.priceDelta !== 0 && (
                      <span className="ml-2 text-black/50 dark:text-white/50">
                        ({value.priceDelta > 0 ? "+" : ""}
                        {formatCLP(value.priceDelta)})
                      </span>
                    )}
                  </span>
                  <form action={deleteProductOptionValueAction}>
                    <input type="hidden" name="id" value={value.id} />
                    <input type="hidden" name="productId" value={product.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Quitar
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <form
              action={createProductOptionValueAction}
              className="flex flex-wrap items-end gap-2 pt-1"
            >
              <input type="hidden" name="optionId" value={option.id} />
              <input type="hidden" name="productId" value={product.id} />
              <label className="flex flex-col gap-1 text-xs">
                Valor
                <input
                  name="label"
                  required
                  placeholder="Ej: 16GB"
                  className="rounded-lg border border-black/15 px-3 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                Ajuste de precio (CLP)
                <input
                  type="number"
                  name="priceDelta"
                  defaultValue={0}
                  placeholder="0"
                  className="w-32 rounded-lg border border-black/15 px-3 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
                />
              </label>
              <button
                type="submit"
                className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              >
                Agregar valor
              </button>
            </form>
          </div>
        ))}

        <form
          action={createProductOptionAction}
          className="flex flex-wrap items-end gap-2 rounded-2xl border border-dashed border-black/15 p-4 dark:border-white/20"
        >
          <input type="hidden" name="productId" value={product.id} />
          <label className="flex flex-col gap-1 text-xs">
            Nuevo grupo de opciones
            <input
              name="name"
              required
              placeholder="Ej: Memoria RAM"
              className="rounded-lg border border-black/15 px-3 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-[#2563eb] px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
          >
            Crear grupo
          </button>
        </form>
      </div>
    </div>
  );
}
