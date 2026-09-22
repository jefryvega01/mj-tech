import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { formatCLP } from "@/lib/format";
import { isMpConfigured } from "@/lib/mercadopago";
import { uploadPaymentProofAction } from "@/app/actions/checkout";

const statusContent: Record<
  string,
  { icon: string; title: string; message: (email: string) => string }
> = {
  pagado: {
    icon: "✅",
    title: "¡Pago aprobado!",
    message: (email) =>
      `Tu pago fue aprobado y el pedido quedó confirmado. Enviamos el comprobante a ${email}.`,
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; comprobante?: string }>;
}) {
  const { id } = await params;
  const { error, comprobante } = await searchParams;
  const order = await db.query.orders.findFirst({
    where: (o, { eq }) => eq(o.id, Number(id)),
    with: { items: true },
  });

  if (!order) notFound();

  const settings = await db.query.siteSettings.findFirst();

  const isTransfer = order.paymentMethod === "transferencia";
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

      {mpActive && order.status === "pendiente" && !isTransfer && (
        <p className="text-xs text-black/50 dark:text-white/50">
          Si ya pagaste y esto no se actualiza en unos segundos, recarga esta
          página: la confirmación llega automáticamente desde Mercado Pago.
        </p>
      )}

      {isTransfer && order.status === "pendiente" && (
        <div className="w-full rounded-2xl border border-black/10 p-4 text-left dark:border-white/10">
          <h2 className="mb-2 font-semibold">Datos para transferir</h2>
          {settings?.transferAccountNumber ? (
            <div className="flex flex-col gap-1 text-sm">
              {settings.transferBankName && (
                <p>
                  <strong>Banco:</strong> {settings.transferBankName}
                </p>
              )}
              {settings.transferAccountType && (
                <p>
                  <strong>Tipo de cuenta:</strong> {settings.transferAccountType}
                </p>
              )}
              <p>
                <strong>Número de cuenta:</strong> {settings.transferAccountNumber}
              </p>
              {settings.transferHolderName && (
                <p>
                  <strong>Titular:</strong> {settings.transferHolderName}
                </p>
              )}
              {settings.transferHolderRut && (
                <p>
                  <strong>RUT:</strong> {settings.transferHolderRut}
                </p>
              )}
              {settings.transferEmail && (
                <p>
                  <strong>Correo de aviso:</strong> {settings.transferEmail}
                </p>
              )}
              <p className="mt-1">
                <strong>Monto a transferir:</strong> {formatCLP(order.total)}
              </p>
              <p className="text-xs text-black/50 dark:text-white/50">
                Incluye tu número de pedido (#{order.id}) como referencia de la
                transferencia.
              </p>
            </div>
          ) : (
            <p className="text-sm text-black/50 dark:text-white/50">
              La tienda todavía no cargó sus datos de transferencia. Contáctanos
              para coordinar el pago.
            </p>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          {order.paymentProofUrl ? (
            <div className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
              {comprobante
                ? "¡Comprobante recibido! "
                : "Ya subiste tu comprobante. "}
              Estamos revisando tu transferencia y te avisaremos por correo
              apenas quede aprobada.
              <div className="mt-1">
                <a
                  href={order.paymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Ver comprobante subido
                </a>
              </div>
            </div>
          ) : (
            <form
              action={uploadPaymentProofAction}
              encType="multipart/form-data"
              className="mt-4 flex flex-col gap-2"
            >
              <input type="hidden" name="orderId" value={order.id} />
              <label className="flex flex-col gap-1 text-sm">
                Sube tu comprobante de transferencia (imagen o PDF)
                <input
                  type="file"
                  name="proofFile"
                  accept="image/*,application/pdf"
                  required
                  className="rounded-lg border border-black/15 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white dark:border-white/20 dark:bg-transparent"
                />
              </label>
              <button
                type="submit"
                className="mt-1 self-start rounded-full bg-[#2563eb] px-5 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
              >
                Enviar comprobante
              </button>
            </form>
          )}
        </div>
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
