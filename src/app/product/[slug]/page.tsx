import { notFound } from "next/navigation";
import ProductView from "@/components/shop/product-view";
import { getCategories, getProduct, getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product ? product.name : "منتج غير موجود",
    description: product?.shortDesc,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const [categories, related] = await Promise.all([
    getCategories(),
    getProducts({ category: product.categorySlug }),
  ]);
  return (
    <ProductView
      product={product}
      category={categories.find((c) => c.slug === product.categorySlug)}
      related={related.filter((p) => p.slug !== product.slug)}
    />
  );
}
