import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";

// Iconos simples en línea (sin depender de una librería de íconos externa).
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4.6.24 1.03.51 1.48.97.45.45.72.88.97 1.48.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43-.24.6-.51 1.03-.97 1.48-.45.45-.88.72-1.48.97-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a3.99 3.99 0 0 1-1.48-.97 3.99 3.99 0 0 1-.97-1.48c-.16-.46-.35-1.26-.4-2.43C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43.24-.6.51-1.03.97-1.48.45-.45.88-.72 1.48-.97.46-.16 1.26-.35 2.43-.4C8.42 2.21 8.8 2.2 12 2.2zm0 1.8c-3.14 0-3.5.01-4.74.07-.96.04-1.48.2-1.82.33-.46.18-.78.39-1.13.73-.34.35-.55.67-.73 1.13-.13.34-.29.86-.33 1.82-.06 1.24-.07 1.6-.07 4.74s.01 3.5.07 4.74c.04.96.2 1.48.33 1.82.18.46.39.78.73 1.13.35.34.67.55 1.13.73.34.13.86.29 1.82.33 1.24.06 1.6.07 4.74.07s3.5-.01 4.74-.07c.96-.04 1.48-.2 1.82-.33.46-.18.78-.39 1.13-.73.34-.35.55-.67.73-1.13.13-.34.29-.86.33-1.82.06-1.24.07-1.6.07-4.74s-.01-3.5-.07-4.74c-.04-.96-.2-1.48-.33-1.82a2.98 2.98 0 0 0-.73-1.13 2.98 2.98 0 0 0-1.13-.73c-.34-.13-.86-.29-1.82-.33-1.24-.06-1.6-.07-4.74-.07zm0 4.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm5.1-2.4a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.7h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.5-1.46h1.6V4.34c-.28-.04-1.22-.12-2.32-.12-2.3 0-3.87 1.4-3.87 3.97v2.11H7.8v3h2.6V21h3.1z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M12.02 2c-5.5 0-10 4.48-10 10 0 1.77.47 3.44 1.28 4.88L2 22l5.27-1.38a9.96 9.96 0 0 0 4.75 1.2h.01c5.5 0 10-4.48 10-10s-4.5-9.82-10.01-9.82zm0 18.2h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.34c0-4.52 3.68-8.2 8.24-8.2 2.2 0 4.27.86 5.83 2.41a8.15 8.15 0 0 1 2.41 5.8c0 4.52-3.68 8.19-8.24 8.19zm4.51-6.13c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.25-.63.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.85.83-.85 2.03 0 1.2.87 2.35 1 2.51.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M16.6 2h-3.1v13.4c0 1.3-1.05 2.36-2.36 2.36a2.36 2.36 0 0 1-2.36-2.36 2.36 2.36 0 0 1 2.36-2.36c.26 0 .5.04.74.11v-3.14a5.5 5.5 0 1 0 5.48 5.75V9.1a6.87 6.87 0 0 0 4.04 1.3V7.3a3.76 3.76 0 0 1-4.8-3.62V2z" />
    </svg>
  );
}

const SOCIAL_LINKS = (settings: {
  footerInstagramUrl: string;
  footerFacebookUrl: string;
  footerWhatsappUrl: string;
  footerTiktokUrl: string;
}) =>
  [
    { url: settings.footerInstagramUrl, label: "Instagram", Icon: InstagramIcon },
    { url: settings.footerFacebookUrl, label: "Facebook", Icon: FacebookIcon },
    { url: settings.footerWhatsappUrl, label: "WhatsApp", Icon: WhatsappIcon },
    { url: settings.footerTiktokUrl, label: "TikTok", Icon: TiktokIcon },
  ].filter((s) => s.url.trim() !== "");

export default async function Footer() {
  const settings = await db.query.siteSettings.findFirst();

  const address = settings?.footerAddress || "";
  const returnPolicy = settings?.footerReturnPolicy || "";
  const socialLinks = SOCIAL_LINKS({
    footerInstagramUrl: settings?.footerInstagramUrl || "",
    footerFacebookUrl: settings?.footerFacebookUrl || "",
    footerWhatsappUrl: settings?.footerWhatsappUrl || "",
    footerTiktokUrl: settings?.footerTiktokUrl || "",
  });
  const mapSrc = address
    ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
    : null;

  return (
    <footer className="brand-gradient-bg mt-16 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {/* Logo y descripción */}
        <div className="flex flex-col gap-3">
          <Image
            src="/logo-full.png"
            alt="MJ Tech"
            width={160}
            height={48}
            className="h-10 w-auto object-contain"
          />
          <p className="text-sm text-white/85">
            Tecnología para todo Chile: notebooks, PC de escritorio y equipos
            gamers.
          </p>
          {socialLinks.length > 0 && (
            <div className="mt-1 flex items-center gap-3">
              {socialLinks.map(({ url, label, Icon }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-full bg-white/15 p-2 transition hover:bg-white/25"
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Dirección + mapa */}
        {address && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
              Ubicación
            </h3>
            <p className="text-sm text-white/85">{address}</p>
            {mapSrc && (
              <div className="overflow-hidden rounded-xl border border-white/20">
                <iframe
                  src={mapSrc}
                  title="Ubicación de MJ Tech"
                  width="100%"
                  height="140"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        )}

        {/* Enlaces rápidos */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Tienda
          </h3>
          <nav className="flex flex-col gap-2 text-sm text-white/85">
            <Link href="/productos" className="hover:text-white">
              Productos
            </Link>
            <Link href="/servicios" className="hover:text-white">
              Servicios
            </Link>
            <Link href="/cuenta" className="hover:text-white">
              Mi cuenta
            </Link>
          </nav>
        </div>

        {/* Política de devoluciones */}
        {returnPolicy && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
              Política de devoluciones
            </h3>
            <p className="text-xs leading-relaxed text-white/80">
              {returnPolicy}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-white/70 sm:px-6">
          © {new Date().getFullYear()} MJ Tech. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
