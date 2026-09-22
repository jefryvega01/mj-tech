import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

/**
 * Devuelve true si hay un access token de Mercado Pago configurado
 * (en `.env`, variable MP_ACCESS_TOKEN).
 */
export function isMpConfigured() {
  return Boolean(process.env.MP_ACCESS_TOKEN?.trim());
}

let client: MercadoPagoConfig | null = null;

function getClient() {
  if (!isMpConfigured()) return null;
  if (!client) {
    client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
      options: { timeout: 8000 },
    });
  }
  return client;
}

export function getPreferenceClient() {
  const c = getClient();
  return c ? new Preference(c) : null;
}

export function getPaymentClient() {
  const c = getClient();
  return c ? new Payment(c) : null;
}

/**
 * URL pública de la app, usada para construir las back_urls y el
 * notification_url que se envían a Mercado Pago. En desarrollo local
 * normalmente será http://localhost:3000 (Mercado Pago no podrá llamar
 * al webhook desde fuera, pero sí redirigir de vuelta al navegador).
 */
export function getAppUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Traduce el estado de un pago de Mercado Pago a nuestro estado interno de pedido. */
export function mapPaymentStatusToOrderStatus(
  mpStatus: string | undefined
): "pendiente" | "pagado" | "cancelado" {
  switch (mpStatus) {
    case "approved":
      return "pagado";
    case "rejected":
    case "cancelled":
      return "cancelado";
    default:
      return "pendiente";
  }
}
