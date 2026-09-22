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
}));

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
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
