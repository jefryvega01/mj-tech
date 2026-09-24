import { db } from "@/db";
import { updateSiteSettingsAction } from "@/app/actions/admin";

export default async function AdminHomeSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const settings = await db.query.siteSettings.findFirst();

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Página de inicio</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Personaliza el título, la imagen principal y qué secciones se
          muestran en el home de la tienda.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {ok && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          Cambios guardados.
        </p>
      )}

      <form
        action={updateSiteSettingsAction}
        encType="multipart/form-data"
        className="flex flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm">
          Título principal
          <input
            name="heroTitle"
            required
            defaultValue={
              settings?.heroTitle || "Todo lo que necesitas, en un solo lugar."
            }
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Subtítulo
          <textarea
            name="heroSubtitle"
            rows={3}
            defaultValue={settings?.heroSubtitle || ""}
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        {settings?.heroImageUrl && (
          <div>
            <p className="mb-1 text-xs text-black/50 dark:text-white/50">
              Imagen actual
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.heroImageUrl}
              alt=""
              className="h-32 max-w-xs rounded-lg border border-black/10 object-cover dark:border-white/10"
            />
          </div>
        )}

        <label className="flex flex-col gap-1 text-sm">
          Cambiar imagen principal (opcional)
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            className="rounded-lg border border-black/15 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          … o URL de imagen
          <input
            name="heroImageUrl"
            defaultValue={settings?.heroImageUrl || ""}
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <div className="flex flex-col gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="bannerEnabled"
              defaultChecked={settings?.bannerEnabled ?? false}
            />
            Mostrar franja de aviso arriba del todo
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Texto del aviso
            <input
              name="bannerText"
              defaultValue={settings?.bannerText || ""}
              placeholder="Ej: Envío gratis en compras sobre $50.000"
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-black/10 p-4 dark:border-white/10">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="showFeaturedProducts"
                defaultChecked={settings?.showFeaturedProducts ?? true}
              />
              Mostrar productos destacados
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Cantidad a mostrar
              <input
                type="number"
                name="featuredProductsCount"
                min={1}
                max={12}
                defaultValue={settings?.featuredProductsCount ?? 4}
                className="rounded-lg border border-black/15 px-3 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
              />
            </label>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-black/10 p-4 dark:border-white/10">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="showFeaturedServices"
                defaultChecked={settings?.showFeaturedServices ?? true}
              />
              Mostrar servicios
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Cantidad a mostrar
              <input
                type="number"
                name="featuredServicesCount"
                min={1}
                max={12}
                defaultValue={settings?.featuredServicesCount ?? 3}
                className="rounded-lg border border-black/15 px-3 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
          <div>
            <p className="text-sm font-medium">Datos para pago por transferencia</p>
            <p className="text-xs text-black/50 dark:text-white/50">
              Se le muestran al cliente después de comprar, para que pueda
              transferir y subir su comprobante.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Banco
              <input
                name="transferBankName"
                defaultValue={settings?.transferBankName || ""}
                placeholder="Ej: Banco Estado"
                className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Tipo de cuenta
              <input
                name="transferAccountType"
                defaultValue={settings?.transferAccountType || ""}
                placeholder="Ej: Cuenta Vista"
                className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Número de cuenta
            <input
              name="transferAccountNumber"
              defaultValue={settings?.transferAccountNumber || ""}
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Nombre del titular
              <input
                name="transferHolderName"
                defaultValue={settings?.transferHolderName || ""}
                className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              RUT del titular
              <input
                name="transferHolderRut"
                defaultValue={settings?.transferHolderRut || ""}
                className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Correo de contacto/confirmación
            <input
              name="transferEmail"
              defaultValue={settings?.transferEmail || ""}
              placeholder="Ej: pagos@mjtech.cl"
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
          <div>
            <p className="text-sm font-medium">Pie de página (footer)</p>
            <p className="text-xs text-black/50 dark:text-white/50">
              Dirección, política de devoluciones y redes sociales que se
              muestran al final de todas las páginas.
            </p>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            Dirección (se usa también para el mapa)
            <input
              name="footerAddress"
              defaultValue={settings?.footerAddress || ""}
              placeholder="Ej: Pericles 1180, Ñuñoa, Santiago, Chile"
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Política de devoluciones
            <textarea
              name="footerReturnPolicy"
              rows={4}
              defaultValue={settings?.footerReturnPolicy || ""}
              className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Instagram (link)
              <input
                name="footerInstagramUrl"
                defaultValue={settings?.footerInstagramUrl || ""}
                placeholder="https://instagram.com/tu_usuario"
                className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Facebook (link)
              <input
                name="footerFacebookUrl"
                defaultValue={settings?.footerFacebookUrl || ""}
                placeholder="https://facebook.com/tu_pagina"
                className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              WhatsApp (link)
              <input
                name="footerWhatsappUrl"
                defaultValue={settings?.footerWhatsappUrl || ""}
                placeholder="https://wa.me/56912345678"
                className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              TikTok (link)
              <input
                name="footerTiktokUrl"
                defaultValue={settings?.footerTiktokUrl || ""}
                placeholder="https://tiktok.com/@tu_usuario"
                className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 self-start rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
