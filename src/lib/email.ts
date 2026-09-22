import nodemailer from "nodemailer";
import { formatCLP } from "./format";

/**
 * Devuelve true si hay credenciales SMTP configuradas (en `.env`, variables
 * SMTP_HOST, SMTP_USER, SMTP_PASS). Sin esto, los correos de comprobante
 * simplemente no se envían (no rompe el flujo del pedido).
 */
export function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

type ReceiptOrder = {
  id: number;
  customerName: string;
  customerEmail: string;
  total: number;
  items: { productName: string; quantity: number; unitPrice: number; selectedOptions: string }[];
};

/**
 * Envía el comprobante de compra al cliente una vez que el admin aprueba
 * la transferencia. Si no hay SMTP configurado, no hace nada (se puede
 * seguir aprobando pedidos manualmente sin que esto falle).
 */
export async function sendReceiptEmail(order: ReceiptOrder) {
  const t = getTransporter();
  if (!t) return false;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const storeName = process.env.STORE_NAME || "MJ Tech";

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">
            ${item.productName}${item.selectedOptions ? `<br/><span style="color:#888;font-size:12px;">${item.selectedOptions}</span>` : ""}
          </td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${formatCLP(item.unitPrice * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#2563eb;">¡Gracias por tu compra en ${storeName}!</h2>
      <p>Hola ${order.customerName}, confirmamos que recibimos tu pago y tu pedido #${order.id} quedó aprobado.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #333;">Producto</th>
            <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #333;">Cant.</th>
            <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #333;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="text-align:right;font-weight:bold;margin-top:8px;">Total: ${formatCLP(order.total)}</p>
      <p style="color:#666;font-size:13px;margin-top:24px;">Este es tu comprobante de compra. Si tienes dudas, responde este correo.</p>
    </div>
  `;

  try {
    await t.sendMail({
      from: `"${storeName}" <${from}>`,
      to: order.customerEmail,
      subject: `Comprobante de compra — Pedido #${order.id}`,
      html,
    });
    return true;
  } catch (err) {
    console.error("Error enviando comprobante por correo:", err);
    return false;
  }
}
