import { notFound } from "next/navigation";
import { db } from "@/db";
import { updateProductAction } from "@/app/actions/admin";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const product = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.id, Number(id)),
    with: { category: true },
  });

  if (!product) notFound();

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-semibold">Editar producto</h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form
        action={updateProductAction}
        encType="multipart/form-data"
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="id" value={product.id} />

        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-32 w-32 rounded-lg border border-black/10 object-cover dark:border-white/10"
          />
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
          Cambiar foto (opcional)
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            className="rounded-lg border border-black/15 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          … o URL de imagen
          <input
            name="imageUrl"
            defaultValue={product.imageUrl}
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
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
    </div>
  );
}
