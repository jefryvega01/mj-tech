import {
  pgTable,
  text,
  integer,
  serial,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- Usuarios ----------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["cliente", "admin"] })
    .notNull()
    .default("cliente"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  bookings: many(bookings),
}));

// ---------- Categorías ----------
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// ---------- Productos ----------
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(), // precio en CLP (sin decimales)
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url").notNull().default(""),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
  options: many(productOptions),
}));

// ---------- Opciones de producto (RAM, disco, procesador, color, etc.) ----------
export const productOptions = pgTable("product_options", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // ej: "Memoria RAM"
  sortOrder: integer("sort_order").notNull().default(0),
});

export const productOptionsRelations = relations(
  productOptions,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productOptions.productId],
      references: [products.id],
    }),
    values: many(productOptionValues),
  })
);

export const productOptionValues = pgTable("product_option_values", {
  id: serial("id").primaryKey(),
  optionId: integer("option_id")
    .notNull()
    .references(() => productOptions.id, { onDelete: "cascade" }),
  label: text("label").notNull(), // ej: "16GB"
  priceDelta: integer("price_delta").notNull().default(0), // se suma al precio base
  sortOrder: integer("sort_order").notNull().default(0),
});

export const productOptionValuesRelations = relations(
  productOptionValues,
  ({ one }) => ({
    option: one(productOptions, {
      fields: [productOptionValues.optionId],
      references: [productOptions.id],
    }),
  })
);

// ---------- Servicios ----------
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(), // precio en CLP
  durationMinutes: integer("duration_minutes").notNull().default(60),
  imageUrl: text("image_url").notNull().default(""),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings),
}));

// ---------- Reservas / Citas ----------
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull().default(""),
  date: text("date").notNull(), // YYYY-MM-DD
  time: text("time").notNull(), // HH:mm
  notes: text("notes").notNull().default(""),
  status: text("status", {
    enum: ["pendiente", "confirmada", "cancelada", "completada"],
  })
    .notNull()
    .default("pendiente"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
}));

// ---------- Pedidos ----------
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull().default(""),
  address: text("address").notNull().default(""),
  total: integer("total").notNull(), // CLP
  status: text("status", {
    enum: ["pendiente", "pagado", "enviado", "entregado", "cancelado"],
  })
    .notNull()
    .default("pendiente"),
  // Referencias de Mercado Pago (Checkout Pro)
  mpPreferenceId: text("mp_preference_id"),
  mpPaymentId: text("mp_payment_id"),
  mpStatusDetail: text("mp_status_detail"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

// ---------- Items de pedido ----------
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  productName: text("product_name").notNull(),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  // Texto legible con las opciones elegidas, ej: "RAM: 16GB, Disco: 512GB SSD"
  selectedOptions: text("selected_options").notNull().default(""),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ---------- Contenido editable del home ----------
// Siempre hay una sola fila (id = 1) con la configuración vigente.
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  heroTitle: text("hero_title")
    .notNull()
    .default("Todo lo que necesitas, en un solo lugar."),
  heroSubtitle: text("hero_subtitle")
    .notNull()
    .default(
      "Compra productos y agenda servicios sin salir de la página. Envíos rápidos y horas disponibles todos los días."
    ),
  heroImageUrl: text("hero_image_url").notNull().default(""),
  bannerEnabled: boolean("banner_enabled").notNull().default(false),
  bannerText: text("banner_text").notNull().default(""),
  showFeaturedProducts: boolean("show_featured_products")
    .notNull()
    .default(true),
  showFeaturedServices: boolean("show_featured_services")
    .notNull()
    .default(true),
  featuredProductsCount: integer("featured_products_count")
    .notNull()
    .default(4),
  featuredServicesCount: integer("featured_services_count")
    .notNull()
    .default(3),
});

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductOption = typeof productOptions.$inferSelect;
export type ProductOptionValue = typeof productOptionValues.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
