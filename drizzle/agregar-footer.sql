-- ============================================================
-- Agrega los campos del footer (dirección, política de
-- devoluciones y redes sociales) a la tabla site_settings.
-- Pega esto en el SQL Editor de Neon y ejecútalo una sola vez.
-- ============================================================

ALTER TABLE "site_settings"
  ADD COLUMN IF NOT EXISTS "footer_address" text NOT NULL DEFAULT 'Pericles 1180, Ñuñoa, Santiago, Chile',
  ADD COLUMN IF NOT EXISTS "footer_return_policy" text NOT NULL DEFAULT 'Todas las compras son finales: no realizamos devolución de dinero. Si tu equipo presenta una falla de fábrica dentro del período de garantía, hacemos el cambio por un equipo equivalente, previa evaluación técnica. Para coordinar un cambio o resolver dudas, contáctanos directamente.',
  ADD COLUMN IF NOT EXISTS "footer_instagram_url" text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "footer_facebook_url" text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "footer_whatsapp_url" text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "footer_tiktok_url" text NOT NULL DEFAULT '';
