import Link from "next/link";
import { db } from "@/db";
import { formatCLP } from "@/lib/format";
import { deleteProductAction } from "@/app/actions/admin";

export default async function AdminProductsPage() {
  const items = await db.query.products.findMany({
    orderBy: (p, { desc }) => desc(p.createdAt),
    with: { category: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
        >
          Nuevo producto
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          No hay productos todavía.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-black/50 dark:border-white/10 dark:text-white/50">
                <th className="py-2 pr-4 font-medium">Nombre</th>
                <th className="py-2 pr-4 font-medium">Categoría</th>
                <th className="py-2 pr-4 font-medium">Precio</th>
                <th className="py-2 pr-4 font-medium">Stock</th>
                <th className="py-2 pr-4 font-medium">Estado</th>
                <th className="py-2 pr-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {items.map((product) => (
                <tr key={product.id}>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-black/60 dark:text-white/60">
                    {product.category?.name || "—"}
                  </td>
                  <td className="py-3 pr-4">{formatCLP(product.price)}</td>
                  <td className="py-3 pr-4">{product.stock}</td>
                  <td className="py-3 pr-4">
                    {product.active ? "Activo" : "Inactivo"}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        className="text-black/40 hover:text-red-600 dark:text-white/40"
                      >
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
