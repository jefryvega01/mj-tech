-- ============================================================
-- Setup completo para tu tienda: crea las tablas y carga los
-- datos de ejemplo (categorías, productos, servicios y tu
-- usuario admin). Pega TODO este archivo en el SQL Editor de
-- Neon y ejecútalo una sola vez.
-- ============================================================

CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"user_id" integer,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text DEFAULT '' NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pendiente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"unit_price" integer NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"total" integer NOT NULL,
	"status" text DEFAULT 'pendiente' NOT NULL,
	"mp_preference_id" text,
	"mp_payment_id" text,
	"mp_status_detail" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"category_id" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'cliente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;

-- ---- Usuario admin (correo: admin@tienda.cl / contraseña: Admin1234) ----
INSERT INTO "users" ("name", "email", "password_hash", "role")
VALUES ('Administrador', 'admin@tienda.cl', '$2b$10$hpjBIyoK5am4la4aLsi3sehCZEL8Bbqc3tqaTe7Uw4YGxwco9cHC6', 'admin');

-- ---- Categorías ----
INSERT INTO "categories" ("name", "slug") VALUES
('Neumáticos', 'neumaticos'),
('Repuestos', 'repuestos'),
('Accesorios', 'accesorios');

-- ---- Productos ----
INSERT INTO "products" ("name", "slug", "description", "price", "stock", "image_url", "category_id", "active") VALUES
('Neumático 195/65 R15', 'neumatico-195-65-r15', 'Neumático radial para uso urbano, excelente agarre en seco y mojado.', 79990, 24, '', (SELECT id FROM categories WHERE slug = 'neumaticos'), true),
('Neumático 205/55 R16', 'neumatico-205-55-r16', 'Ideal para sedanes medianos, baja resistencia a la rodadura.', 94990, 18, '', (SELECT id FROM categories WHERE slug = 'neumaticos'), true),
('Filtro de aceite', 'filtro-de-aceite', 'Filtro de aceite de alta calidad, compatible con la mayoría de vehículos livianos.', 8990, 60, '', (SELECT id FROM categories WHERE slug = 'repuestos'), true),
('Pastillas de freno (juego)', 'pastillas-de-freno-juego', 'Juego de pastillas de freno delanteras, cerámicas de bajo ruido.', 34990, 30, '', (SELECT id FROM categories WHERE slug = 'repuestos'), true),
('Tapa de llanta universal', 'tapa-de-llanta-universal', 'Set de 4 tapas de llanta, ajuste universal.', 12990, 40, '', (SELECT id FROM categories WHERE slug = 'accesorios'), true);

-- ---- Servicios ----
INSERT INTO "services" ("name", "slug", "description", "price", "duration_minutes", "image_url", "active") VALUES
('Instalación y balanceo de neumáticos', 'instalacion-y-balanceo-de-neumaticos', 'Montaje, balanceo y alineación básica incluidos.', 14990, 45, '', true),
('Cambio de aceite y filtro', 'cambio-de-aceite-y-filtro', 'Cambio de aceite de motor y filtro, revisión de niveles.', 24990, 40, '', true),
('Revisión de frenos', 'revision-de-frenos', 'Diagnóstico y revisión del sistema de frenos completo.', 12990, 30, '', true);
