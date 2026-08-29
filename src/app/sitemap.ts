import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mesbar.store";
  const products = await getProducts();
  const staticRoutes = ["", "/shop", "/track", "/support", "/about", "/login", "/register"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
  }));
  const productRoutes = products.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: new Date(),
  }));
  return [...staticRoutes, ...productRoutes];
}
