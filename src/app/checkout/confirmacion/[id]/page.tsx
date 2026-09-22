import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { formatCLP } from "@/lib/format";
import { isMpConfigured } from "@/lib/mercadopago";

const statusContent: Record<
  string,
  { icon: string; title: string; message: (email: string) => string }
> = {
  pagado: {
    icon: "✅",
    title: "¡Pago aprobado!",
    message: (email) =>
      `Tu pago fue aprobado y el pedido quedó confirmado. Enviaremos los detalles a ${email}.`,
  },
  cancelado: {
    icon: "❌",
    title: "El pago no se pudo procesar",
    message: () =>
      "El pago fue rechazado o cancelado. Puedes intentar nuevamente desde tu carrito.",
  },
  pendiente: {
    icon: "⏳",
    title: "Pedido registrado",
    message: (email) =>
      `Tu pedido quedó registrado. Enviaremos la confirmación a ${email} apenas se confirme el pago.`,
  },
};

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.query.orders.findFirst({
    where: (o, { eq }) => eq(o.id, Number(id)),
    with: { items: true },
  });

  if (!order) notFound();

  const content = statusContent[order.status] ?? statusContent.pendiente;
  const mpActive = isMpConfigured();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
      <div className="text-4xl">{content.icon}</div>
      <h1 className="text-2xl font-semibold">{content.title}</h1>
      <p className="text-black/60 dark:text-white/60">
        Pedido #{order.id} · {formatCLP(order.total)}
        <br />
        {content.message(order.customerEmail)}
      </p>

      {mpActive && order.status === "pendiente" && (
        <p className="text-xs text-black/50 dark:text-white/50">
          Si ya pagaste y esto no se actualiza en unos segundos, recarga esta
          página: la confirmación llega automáticamente desde Mercado Pago.
        </p>
      )}

      <div className="w-full rounded-2xl border border-black/10 p-4 text-left text-sm dark:border-white/10">
        {order.items.map((item) => (
          <div key={item.id} className="flex flex-col gap-0.5 py-1">
            <div className="flex justify-between">
              <span>
                {item.quantity} × {item.productName}
              </span>
              <span>{formatCLP(item.unitPrice * item.quantity)}</span>
            </div>
            {item.selectedOptions && (
              <span className="text-xs text-black/40 dark:text-white/40">
                {item.selectedOptions}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {order.status === "cancelado" && (
          <Link
            href="/checkout"
            className="mt-2 rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Reintentar pago
          </Link>
        )}
        <Link
          href="/productos"
          className="mt-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
