import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export type PendingLine = {
  slug: string;
  name: string;
  categorySlug: string;
  price: number;
  qty: number;
};

// ---------------------------------------------------------------------------
// Multi-tenant platform foundation (Window 0)
// Every merchant-facing row is scoped to a store (tenant) via store_id.
// ---------------------------------------------------------------------------

// A tenant = one merchant's business. Each store has its own catalog, orders,
// customers, settings, domain, theme, and staff.
export const stores = pgTable("stores", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(), // subdomain: <slug>.msbarsa.app
  name: text("name").notNull(),
  ownerId: text("owner_id"), // owner user id
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  status: text("status").notNull().default("active"), // active | suspended | pending
  plan: text("plan").notNull().default("free"), // free | plus | pro | enterprise
  domain: text("domain").notNull().default(""), // custom domain
  logo: text("logo").notNull().default(""),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Roles a user can hold on the platform globally.
export const USERS_ROLES = ["customer", "merchant", "admin"] as const;
export type UserRole = (typeof USERS_ROLES)[number];

export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").$type<UserRole>().notNull().default("customer"),
    // For merchants, the store they own (denormalized convenience).
    storeId: text("store_id"),
    avatar: text("avatar").notNull().default(""),
    phone: text("phone").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("users_store_idx").on(t.storeId)]
);

// Staff membership of a user within a store (owner, manager, staff...).
export const storeMembers = pgTable(
  "store_members",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role").notNull().default("staff"), // owner | manager | staff
    permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("store_member_unique").on(t.storeId, t.userId)]
);

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

// ---------------------------------------------------------------------------
// Catalog — scoped to store
// ---------------------------------------------------------------------------

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull().default(""),
    icon: text("icon").notNull().default("box"),
    tint: text("tint").notNull().default("cyan"),
    sort: integer("sort").notNull().default(0),
    parentId: text("parent_id"), // subcategories
    image: text("image").notNull().default(""),
    seoTitle: text("seo_title").notNull().default(""),
    seoDesc: text("seo_desc").notNull().default(""),
    status: text("status").notNull().default("active"),
  },
  (t) => [uniqueIndex("category_store_slug").on(t.storeId, t.slug)]
);

export const brands = pgTable(
  "brands",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    logo: text("logo").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("brand_store_slug").on(t.storeId, t.slug)]
);

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id").notNull(),
    slug: text("slug").notNull(),
    categorySlug: text("category_slug").notNull(),
    brandId: text("brand_id"),
    name: text("name").notNull(),
    latinName: text("latin_name").notNull().default(""),
    sku: text("sku").notNull().default(""),
    barcode: text("barcode").notNull().default(""),
    shortDesc: text("short_desc").notNull().default(""),
    longDesc: text("long_desc").notNull().default(""),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    video: text("video").notNull().default(""),
    type: text("type").notNull().default("physical"), // physical | digital | service | preorder
    licenseType: text("license_type").notNull().default("Retail"),
    devices: text("devices").notNull().default("جهاز واحد"),
    duration: text("duration").notNull().default("مدى الحياة"),
    cost: integer("cost").notNull().default(0),
    price: integer("price").notNull(),
    comparePrice: integer("compare_price"),
    salePrice: integer("sale_price"),
    taxClass: text("tax_class").notNull().default("standard"),
    weight: real("weight").notNull().default(0),
    rating: real("rating").notNull().default(4.9),
    ratingCount: integer("rating_count").notNull().default(0),
    badge: text("badge"),
    isDeal: boolean("is_deal").notNull().default(false),
    status: text("status").notNull().default("active"), // active | draft | archived
    stock: integer("stock").notNull().default(0),
    minQty: integer("min_qty").notNull().default(1),
    maxQty: integer("max_qty"),
    sort: integer("sort").notNull().default(0),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    customFields: jsonb("custom_fields").$type<Record<string, string>>().notNull().default({}),
    seoTitle: text("seo_title").notNull().default(""),
    seoDesc: text("seo_desc").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("products_store_category_idx").on(t.storeId, t.categorySlug),
    index("products_store_slug_idx").on(t.storeId, t.slug),
    uniqueIndex("product_store_slug").on(t.storeId, t.slug),
  ]
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id").notNull(),
    productId: text("product_id").notNull(),
    name: text("name").notNull().default(""),
    sku: text("sku").notNull().default(""),
    barcode: text("barcode").notNull().default(""),
    price: integer("price").notNull(),
    cost: integer("cost").notNull().default(0),
    stock: integer("stock").notNull().default(0),
    image: text("image").notNull().default(""),
    options: jsonb("options").$type<Record<string, string>>().notNull().default({}),
  },
  (t) => [index("variant_product_idx").on(t.productId)]
);

// ---------------------------------------------------------------------------
// Orders — scoped to store
// ---------------------------------------------------------------------------

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id").notNull(),
    orderNumber: text("order_number").notNull(),
    userId: text("user_id"),
    customerName: text("customer_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    address: jsonb("address").$type<Record<string, string>>(),
    paymentMethod: text("payment_method").notNull().default("card"),
    paymentProvider: text("payment_provider").notNull().default("simulated"),
    paymentId: text("payment_id"),
    shippingMethod: text("shipping_method").notNull().default(""),
    shippingCost: integer("shipping_cost").notNull().default(0),
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").notNull().default(0),
    tax: integer("tax").notNull().default(0),
    total: integer("total").notNull(),
    status: text("status").notNull().default("paid"),
    paymentStatus: text("payment_status").notNull().default("paid"),
    cartSnapshot: jsonb("cart_snapshot").$type<PendingLine[]>(),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("orders_email_idx").on(t.email),
    index("orders_user_idx").on(t.userId),
    index("orders_store_idx").on(t.storeId),
    uniqueIndex("order_store_number").on(t.storeId, t.orderNumber),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id").notNull(),
    orderId: text("order_id").notNull(),
    productId: text("product_id"),
    productSlug: text("product_slug").notNull(),
    productName: text("product_name").notNull(),
    categorySlug: text("category_slug").notNull().default("windows"),
    price: integer("price").notNull(),
    qty: integer("qty").notNull().default(1),
    variantId: text("variant_id"),
    variantName: text("variant_name").notNull().default(""),
    licenseKey: text("license_key").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId), index("order_items_store_idx").on(t.storeId)]
);

export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id").notNull(),
    userId: text("user_id"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    address: jsonb("address").$type<Record<string, string>>(),
    totalSpent: integer("total_spent").notNull().default(0),
    orderCount: integer("order_count").notNull().default(0),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("customer_store_email").on(t.storeId, t.email)]
);

export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id").notNull().default(""),
  kind: text("kind").notNull().default("support"),
  name: text("name").notNull().default(""),
  email: text("email").notNull(),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Audit log (security/tenant requirement)
// ---------------------------------------------------------------------------
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id").notNull().default(""),
    userId: text("user_id"),
    action: text("action").notNull(),
    entity: text("entity").notNull().default(""),
    entityId: text("entity_id"),
    meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_store_idx").on(t.storeId)]
);
