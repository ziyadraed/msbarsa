import { Suspense } from "react";
import ShopClient from "@/components/shop/shop-client";
import { getCategories, getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "المتجر",
  description: "تصفح جميع التراخيص الرقمية الأصلية — أنظمة تشغيل، إنتاجية، تصميم، حماية، وهندسة.",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ category: sp.c || undefined, deals: sp.deals === "1" }),
    getCategories(),
  ]);
  return (
    <Suspense>
      <ShopClient initialProducts={products} categories={categories} />
    </Suspense>
  );
}
