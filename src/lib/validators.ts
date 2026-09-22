import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional().default(""),
  price: z.coerce.number().int().min(0, "El precio no puede ser negativo"),
  stock: z.coerce.number().int().min(0).default(0),
  imageUrl: z.string().optional().default(""),
  categoryName: z.string().optional().default(""),
  active: z.coerce.boolean().optional().default(true),
});

export const serviceSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional().default(""),
  price: z.coerce.number().int().min(0, "El precio no puede ser negativo"),
  durationMinutes: z.coerce.number().int().min(5).default(60),
  imageUrl: z.string().optional().default(""),
  active: z.coerce.boolean().optional().default(true),
});

export const productOptionSchema = z.object({
  name: z.string().min(1, "Nombre de la opción requerido"),
});

export const productOptionValueSchema = z.object({
  label: z.string().min(1, "Valor requerido"),
  priceDelta: z.coerce.number().int().default(0),
});

export const siteSettingsSchema = z.object({
  heroTitle: z.string().min(1, "El título es requerido"),
  heroSubtitle: z.string().optional().default(""),
  heroImageUrl: z.string().optional().default(""),
  bannerEnabled: z.coerce.boolean().optional().default(false),
  bannerText: z.string().optional().default(""),
  showFeaturedProducts: z.coerce.boolean().optional().default(true),
  showFeaturedServices: z.coerce.boolean().optional().default(true),
  featuredProductsCount: z.coerce.number().int().min(1).max(12).default(4),
  featuredServicesCount: z.coerce.number().int().min(1).max(12).default(3),
});

export const bookingSchema = z.object({
  serviceId: z.coerce.number().int(),
  customerName: z.string().min(2, "Nombre requerido"),
  customerEmail: z.string().email("Correo inválido"),
  customerPhone: z.string().optional().default(""),
  date: z.string().min(1, "Selecciona una fecha"),
  time: z.string().min(1, "Selecciona una hora"),
  notes: z.string().optional().default(""),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Nombre requerido"),
  customerEmail: z.string().email("Correo inválido"),
  customerPhone: z.string().optional().default(""),
  address: z.string().min(4, "Ingresa una dirección de despacho"),
  items: z
    .array(
      z.object({
        productId: z.number().int(),
        quantity: z.number().int().min(1),
        unitPrice: z.number().int().min(0).optional(),
        selectedOptions: z.string().optional().default(""),
      })
    )
    .min(1, "El carrito está vacío"),
});
