import { createProductAction } from "@/app/actions/admin";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-semibold">Nuevo producto</h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form
        action={createProductAction}
        encType="multipart/form-data"
        className="flex flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            name="name"
            required
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Descripción
          <textarea
            name="description"
            rows={3}
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
              defaultValue={0}
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Categoría
          <input
            name="categoryName"
            placeholder="Ej: Neumáticos"
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Fotos (opcional, hasta 5)
          <input
            type="file"
            name="imageFiles"
            accept="image/*"
            multiple
            className="rounded-lg border border-black/15 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white dark:border-white/20 dark:bg-transparent"
          />
          <span className="text-xs text-black/50 dark:text-white/50">
            La primera foto que elijas queda como la portada del producto.
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          … o URL de imagen (opcional, si no subes fotos)
          <input
            name="imageUrl"
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked />
          Producto activo (visible en la tienda)
        </label>

        <button
          type="submit"
          className="mt-2 self-start rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
        >
          Crear producto
        </button>
      </form>
    </div>
  );
}
