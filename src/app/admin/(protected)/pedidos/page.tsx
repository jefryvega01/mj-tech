import { db } from "@/db";
import { formatCLP } from "@/lib/format";
import { updateOrderStatusAction } from "@/app/actions/admin";

const statuses = ["pendiente", "pagado", "enviado", "entregado", "cancelado"];

export default async function AdminOrdersPage() {
  const orders = await db.query.orders.findMany({
    orderBy: (o, { desc }) => desc(o.createdAt),
    with: { items: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          No hay pedidos todavía.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-black/10 p-4 dark:border-white/10"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    Pedido #{order.id} · {order.customerName}
                  </p>
                  <p className="text-sm text-black/50 dark:text-white/50">
                    {order.customerEmail} · {order.customerPhone || "sin teléfono"}
                  </p>
                  <p className="text-sm text-black/50 dark:text-white/50">
                    {order.address}
                  </p>
                  {order.mpPaymentId && (
                    <p className="text-xs text-black/40 dark:text-white/40">
                      Pago Mercado Pago #{order.mpPaymentId}
                      {order.mpStatusDetail ? ` · ${order.mpStatusDetail}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatCLP(order.total)}</span>
                  <form action={updateOrderStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={order.id} />
                    <select
                      name="status"
                      defaultValue={order.status}
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
              </div>
              <div className="mt-3 flex flex-col divide-y divide-black/10 border-t border-black/10 pt-3 text-sm dark:divide-white/10 dark:border-white/10">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>
                      {item.quantity} × {item.productName}
                    </span>
                    <span>{formatCLP(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
