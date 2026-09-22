import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { formatCLP } from "@/lib/format";
import { logoutAction } from "@/app/actions/auth";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/cuenta/login");

  const [orders, bookings] = await Promise.all([
    db.query.orders.findMany({
      where: (o, { eq }) => eq(o.userId, session.userId),
      orderBy: (o, { desc }) => desc(o.createdAt),
      with: { items: true },
    }),
    db.query.bookings.findMany({
      where: (b, { eq }) => eq(b.userId, session.userId),
      orderBy: (b, { desc }) => desc(b.createdAt),
      with: { service: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hola, {session.name}</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            {session.email}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Mis pedidos</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">
            Aún no tienes pedidos.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">Pedido #{order.id}</p>
                  <p className="text-black/50 dark:text-white/50">
                    {order.items.length} producto(s) · {order.status}
                  </p>
                </div>
                <span className="font-medium">{formatCLP(order.total)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Mis reservas</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">
            Aún no tienes reservas.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{booking.service.name}</p>
                  <p className="text-black/50 dark:text-white/50">
                    {booking.date} a las {booking.time}
                  </p>
                </div>
                <span className="capitalize">{booking.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
