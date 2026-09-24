import { db } from "@/db";

// Mensaje precargado que ve el cliente al abrir el chat (lo puede editar
// antes de enviarlo).
const DEFAULT_MESSAGE = "Hola, tengo una consulta sobre sus productos o servicios.";

export default async function WhatsappFloatButton() {
  const settings = await db.query.siteSettings.findFirst();
  const raw = settings?.footerWhatsappUrl || "";
  // El campo puede tener un link tipo "https://wa.me/56912345678" o solo el
  // número; nos quedamos con los dígitos y armamos el link con el mensaje.
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  const href = `https://wa.me/${digits}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition hover:scale-105 hover:bg-[#20bd5a]"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
        <path d="M12.02 2c-5.5 0-10 4.48-10 10 0 1.77.47 3.44 1.28 4.88L2 22l5.27-1.38a9.96 9.96 0 0 0 4.75 1.2h.01c5.5 0 10-4.48 10-10s-4.5-9.82-10.01-9.82zm0 18.2h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.34c0-4.52 3.68-8.2 8.24-8.2 2.2 0 4.27.86 5.83 2.41a8.15 8.15 0 0 1 2.41 5.8c0 4.52-3.68 8.19-8.24 8.19zm4.51-6.13c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.25-.63.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.85.83-.85 2.03 0 1.2.87 2.35 1 2.51.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
      </svg>
    </a>
  );
}
