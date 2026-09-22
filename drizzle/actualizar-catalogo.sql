-- ============================================================
-- Actualiza tu tienda al rubro de MJ Tech: oculta los productos
-- y servicios de ejemplo (neumáticos/autos) y crea tus categorías
-- nuevas. Pégalo en el SQL Editor de Neon y ejecútalo una vez.
-- ============================================================

-- Oculta los productos de ejemplo (no los borra, por si ya hay pedidos
-- asociados; simplemente dejan de verse en la tienda)
UPDATE products SET active = false
WHERE slug IN (
  'neumatico-195-65-r15',
  'neumatico-205-55-r16',
  'filtro-de-aceite',
  'pastillas-de-freno-juego',
  'tapa-de-llanta-universal'
);

-- Oculta los servicios de ejemplo
UPDATE services SET active = false
WHERE slug IN (
  'instalacion-y-balanceo-de-neumaticos',
  'cambio-de-aceite-y-filtro',
  'revision-de-frenos'
);

-- Crea tus categorías (no falla si ya existen)
INSERT INTO categories (name, slug) VALUES
('Notebooks', 'notebooks'),
('PC de Escritorio', 'pc-de-escritorio'),
('Equipos Gamers', 'equipos-gamers')
ON CONFLICT (slug) DO NOTHING;

-- Agrega servicios nuevos acordes a MJ Tech (puedes editarlos o
-- borrarlos después desde /admin/servicios)
INSERT INTO services (name, slug, description, price, duration_minutes, image_url, active) VALUES
('Formateo e instalación de sistema operativo', 'formateo-e-instalacion-de-sistema-operativo', 'Formateo completo, instalación de Windows y controladores, respaldo de tus archivos.', 15990, 60, '', true),
('Armado de PC a pedido', 'armado-de-pc-a-pedido', 'Armamos tu equipo con las piezas que elijas, con pruebas de estabilidad incluidas.', 29990, 90, '', true),
('Mantención y limpieza de equipo', 'mantencion-y-limpieza-de-equipo', 'Limpieza interna, cambio de pasta térmica y revisión general de rendimiento.', 12990, 45, '', true)
ON CONFLICT (slug) DO NOTHING;
