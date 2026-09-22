import { notFound } from "next/navigation";
import { db } from "@/db";
import { formatCLP } from "@/lib/format";
import { createBookingAction } from "@/app/actions/booking";

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;

  const service = await db.query.services.findFirst({
    where: (s, { eq }) => eq(s.slug, slug),
  });

  if (!service || !service.active) notFound();

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="flex aspect-[3/2] items-center justify-center rounded-2xl bg-black/5 text-6xl dark:bg-white/5">
          🛠️
        </div>
        <h1 className="text-2xl font-semibold">{service.name}</h1>
        <p className="text-xl font-semibold">{formatCLP(service.price)}</p>
        <p className="text-sm text-black/50 dark:text-white/50">
          Duración aproximada: {service.durationMinutes} minutos
        </p>
        <p className="whitespace-pre-line text-black/70 dark:text-white/70">
          {service.description || "Sin descripción."}
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-lg font-semibold">Reserva tu hora</h2>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <form action={createBookingAction} className="flex flex-col gap-3">
          <input type="hidden" name="serviceId" value={service.id} />
          <input type="hidden" name="serviceSlug" value={service.slug} />

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

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Fecha
              <input
                type="date"
                name="date"
                min={today}
                required
                className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Hora
              <input
                type="time"
                name="time"
                required
                className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            Notas (opcional)
            <textarea
              name="notes"
              rows={3}
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>

          <button
            type="submit"
            className="mt-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
          >
            Confirmar reserva
          </button>
        </form>
      </div>
    </div>
  );
}
