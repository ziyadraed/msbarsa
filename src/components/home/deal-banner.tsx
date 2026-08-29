"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, ArrowLeft } from "lucide-react";
import ProductArt from "@/components/store/product-art";
import { formatSAR, discountPct } from "@/lib/utils";
import type { Product } from "@/lib/catalog";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export default function DealBanner({ product }: { product: Product }) {
  const [remain, setRemain] = useState(48 * 3600);

  useEffect(() => {
    const KEY = "msbar_deal_deadline";
    let deadline = 0;
    try {
      deadline = Number(localStorage.getItem(KEY) || 0);
      if (!deadline || deadline < Date.now()) {
        deadline = Date.now() + 48 * 3600 * 1000;
        localStorage.setItem(KEY, String(deadline));
      }
    } catch {
      deadline = Date.now() + 48 * 3600 * 1000;
    }
    const tick = () => setRemain(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const h = Math.floor(remain / 3600);
  const m = Math.floor((remain % 3600) / 60);
  const s = remain % 60;
  const pct = discountPct(product.price, product.comparePrice);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-lime-pop/20 bg-gradient-to-l from-ink-800 via-ink-850 to-ink-900">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute -top-32 -start-32 w-96 h-96 rounded-full bg-lime-pop/10 blur-[100px]" />
        <div className="relative grid lg:grid-cols-2 items-center">
          <div className="p-10 lg:p-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-pop/15 border border-lime-pop/40 text-lime-pop text-xs font-bold px-4 py-2">
              <Flame className="w-4 h-4" />
              صفقة الأسبوع — خصم {pct}%
            </span>
            <h2 className="mt-6 text-4xl lg:text-5xl font-bold leading-tight">{product.name}</h2>
            <p className="mt-4 text-ink-300 leading-8 max-w-md">{product.shortDesc}</p>

            <div className="mt-7 flex items-center gap-4" dir="ltr">
              {[
                { v: pad(h), l: "ساعة" },
                { v: pad(m), l: "دقيقة" },
                { v: pad(s), l: "ثانية" },
              ].map((u) => (
                <div key={u.l} className="text-center">
                  <div className="w-[74px] py-3 rounded-2xl glass-strong font-latin text-3xl font-bold text-lime-pop tabular-nums">
                    {u.v}
                  </div>
                  <p className="mt-2 text-[11px] text-ink-300">{u.l}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <div>
                <span className="text-4xl font-bold font-latin text-lime-pop">{formatSAR(product.price)}</span>
                {product.comparePrice && (
                  <span className="ms-3 text-lg text-ink-300 line-through font-latin">{formatSAR(product.comparePrice)}</span>
                )}
              </div>
              <Link href={`/product/${product.slug}`} className="btn-primary rounded-2xl px-7 py-3.5 font-bold inline-flex items-center gap-2">
                اقتنص العرض
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="relative h-[320px] lg:h-[460px]">
            <ProductArt category={product.categorySlug} latin={product.latinName} size="lg" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-ink-850/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
