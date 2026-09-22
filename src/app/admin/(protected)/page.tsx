import { db } from "@/db";
import { formatCLP } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [products, services, orders, bookings] = await Promise.all([
    db.query.products.findMany(),
    db.query.services.findMany(),
    db.query.orders.findMany(),
    db.query.bookings.findMany(),
  ]);

  const totalSales = orders
    .filter((o) => o.status !== "cancelado")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === "pendiente").length;
  const pendingBookings = bookings.filter(
    (b) => b.status === "pendiente"
  ).length;

  const cards = [
    { label: "Productos", value: products.length },
    { label: "Servicios", value: services.length },
    { label: "Pedidos", value: orders.length },
    { label: "Reservas", value: bookings.length },
    { label: "Pedidos pendientes", value: pendingOrders },
    { label: "Reservas pendientes", value: pendingBookings },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Resumen</h1>

      <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <p className="text-sm text-black/50 dark:text-white/50">
          Ventas totales (no canceladas)
        </p>
        <p className="text-3xl font-semibold">{formatCLP(totalSales)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-black/10 p-4 dark:border-white/10"
          >
            <p className="text-sm text-black/50 dark:text-white/50">
              {card.label}
            </p>
            <p className="text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
