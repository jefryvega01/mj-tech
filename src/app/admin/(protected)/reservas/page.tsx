import { db } from "@/db";
import { updateBookingStatusAction } from "@/app/actions/admin";

const statuses = ["pendiente", "confirmada", "cancelada", "completada"];

export default async function AdminBookingsPage() {
  const bookings = await db.query.bookings.findMany({
    orderBy: (b, { desc }) => desc(b.createdAt),
    with: { service: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Reservas</h1>

      {bookings.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          No hay reservas todavía.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10"
            >
              <div>
                <p className="font-medium">
                  {booking.service.name} · {booking.customerName}
                </p>
                <p className="text-sm text-black/50 dark:text-white/50">
                  {booking.date} a las {booking.time} · {booking.customerEmail}
                </p>
                {booking.notes && (
                  <p className="text-sm text-black/50 dark:text-white/50">
                    Nota: {booking.notes}
                  </p>
                )}
              </div>
              <form action={updateBookingStatusAction} className="flex items-center gap-2">
                <input type="hidden" name="id" value={booking.id} />
                <select
                  name="status"
                  defaultValue={booking.status}
                  className="rounded-lg border border-black/15 px-2 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-[#2563eb] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
                >
                  Guardar
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
