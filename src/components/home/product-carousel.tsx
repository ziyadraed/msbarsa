"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import ProductCard from "@/components/store/product-card";
import type { Product } from "@/lib/catalog";

// Salla-style horizontal product carousel ("الأكثر مبيعًا" slider with arrows).
export default function ProductCarousel({
  title,
  subtitle,
  products,
  displayAllUrl,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  displayAllUrl?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByDir(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  }

  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-2">BEST OFFERS</p>
          <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-ink-300 mt-1.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {displayAllUrl && (
            <Link href={displayAllUrl} className="btn-ghost rounded-2xl px-4 py-2.5 text-sm font-semibold">
              عرض الكل
            </Link>
          )}
          <div className="flex gap-2">
            <button onClick={() => scrollByDir(1)} aria-label="السابق" className="btn-ghost rounded-2xl w-11 h-11 grid place-items-center hover:text-neon-400">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={() => scrollByDir(-1)} aria-label="التالي" className="btn-ghost rounded-2xl w-11 h-11 grid place-items-center hover:text-neon-400">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div ref={trackRef} className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar">
        {products.map((p, i) => (
          <div key={p.slug} className="snap-start shrink-0 w-[260px] sm:w-[290px]">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
