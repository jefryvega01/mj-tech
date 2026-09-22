CREATE TABLE "product_option_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"option_id" integer NOT NULL,
	"label" text NOT NULL,
	"price_delta" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"hero_title" text DEFAULT 'Todo lo que necesitas, en un solo lugar.' NOT NULL,
	"hero_subtitle" text DEFAULT 'Compra productos y agenda servicios sin salir de la página. Envíos rápidos y horas disponibles todos los días.' NOT NULL,
	"hero_image_url" text DEFAULT '' NOT NULL,
	"banner_enabled" boolean DEFAULT false NOT NULL,
	"banner_text" text DEFAULT '' NOT NULL,
	"show_featured_products" boolean DEFAULT true NOT NULL,
	"show_featured_services" boolean DEFAULT true NOT NULL,
	"featured_products_count" integer DEFAULT 4 NOT NULL,
	"featured_services_count" integer DEFAULT 3 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "selected_options" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_option_values" ADD CONSTRAINT "product_option_values_option_id_product_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."product_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;