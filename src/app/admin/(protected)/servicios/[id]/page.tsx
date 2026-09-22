import { notFound } from "next/navigation";
import { db } from "@/db";
import { updateServiceAction } from "@/app/actions/admin";

export default async function EditServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const service = await db.query.services.findFirst({
    where: (s, { eq }) => eq(s.id, Number(id)),
  });

  if (!service) notFound();

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-semibold">Editar servicio</h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form action={updateServiceAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={service.id} />

        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            name="name"
            defaultValue={service.name}
            required
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Descripción
          <textarea
            name="description"
            rows={3}
            defaultValue={service.description}
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
              defaultValue={service.price}
              required
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Duración (min)
            <input
              type="number"
              name="durationMinutes"
              min={5}
              defaultValue={service.durationMinutes}
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          URL de imagen (opcional)
          <input
            name="imageUrl"
            defaultValue={service.imageUrl}
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={service.active} />
          Servicio activo (visible en la tienda)
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
