import { pgTable, text, integer, real, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export type PendingLine = { slug: string; name: string; categorySlug: string; price: number; qty: number };

export const categories = pgTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  icon: text("icon").notNull().default("box"),
  tint: text("tint").notNull().default("cyan"),
  sort: integer("sort").notNull().default(0),
});

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    categorySlug: text("category_slug").notNull(),
    name: text("name").notNull(),
    latinName: text("latin_name").notNull().default(""),
    shortDesc: text("short_desc").notNull().default(""),
    longDesc: text("long_desc").notNull().default(""),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    licenseType: text("license_type").notNull().default("Retail"),
    devices: text("devices").notNull().default("جهاز واحد"),
    duration: text("duration").notNull().default("مدى الحياة"),
    price: integer("price").notNull(),
    comparePrice: integer("compare_price"),
    rating: real("rating").notNull().default(4.9),
    ratingCount: integer("rating_count").notNull().default(0),
    badge: text("badge"),
    isDeal: boolean("is_deal").notNull().default(false),
    stock: integer("stock").notNull().default(999),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("products_category_idx").on(t.categorySlug)]
);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    token: text("token").notNull().unique(),
    userId: text("user_id").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)]
);

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id"),
    customerName: text("customer_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    paymentMethod: text("payment_method").notNull().default("card"),
    paymentProvider: text("payment_provider").notNull().default("simulated"),
    paymentId: text("payment_id"),
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").notNull().default(0),
    total: integer("total").notNull(),
    status: text("status").notNull().default("paid"),
    cartSnapshot: jsonb("cart_snapshot").$type<PendingLine[]>() ,
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("orders_email_idx").on(t.email), index("orders_user_idx").on(t.userId)]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id").notNull(),
    productSlug: text("product_slug").notNull(),
    productName: text("product_name").notNull(),
    categorySlug: text("category_slug").notNull().default("windows"),
    price: integer("price").notNull(),
    qty: integer("qty").notNull().default(1),
    licenseKey: text("license_key").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)]
);

export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  kind: text("kind").notNull().default("support"),
  name: text("name").notNull().default(""),
  email: text("email").notNull(),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
