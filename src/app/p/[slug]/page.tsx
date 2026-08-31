import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoreBySlug } from "@/lib/tenant";
import { DEFAULT_STORE_SLUG } from "@/lib/tenant";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type MerchantPage = { slug: string; title: string; content: string };

async function getPages(): Promise<MerchantPage[]> {
  try {
    const store = await getStoreBySlug(DEFAULT_STORE_SLUG);
    const s = (store?.settings ?? {}) as Record<string, unknown>;
    return Array.isArray(s.pages) ? (s.pages as MerchantPage[]) : [];
  } catch {
    return [];
  }
}

export default async function MerchantPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pages = await getPages();
  const page = pages.find((p) => p.slug === slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-300 hover:text-neon-400 mb-8">
        <ArrowLeft className="w-4 h-4 rotate-180" />
        الرئيسية
      </Link>
      <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-3">PAGE</p>
      <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-10">{page.title}</h1>
      <article className="prose-custom">
        {page.content.split("\n").map((para, i) =>
          para.trim() ? (
            <p key={i} className="text-ink-300 leading-9 mb-5">{para}</p>
          ) : null
        )}
      </article>
    </div>
  );
}
