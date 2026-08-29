"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, BadgePercent, PackageX } from "lucide-react";
import ProductCard from "@/components/store/product-card";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/lib/catalog";

const SORTS = [
  { value: "featured", label: "الأبرز" },
  { value: "price-asc", label: "السعر: الأقل أولًا" },
  { value: "price-desc", label: "السعر: الأعلى أولًا" },
  { value: "discount", label: "أعلى خصم" },
  { value: "rating", label: "الأعلى تقييمًا" },
];

export default function ShopClient({ initialProducts, categories }: { initialProducts: Product[]; categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const activeCat = params.get("c") ?? "";
  const dealsOnly = params.get("deals") === "1";

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");

  const setParam = (key: string, value: string | null) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    router.push(`/shop?${sp.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    let list = [...initialProducts];
    if (dealsOnly) list = list.filter((p) => p.isDeal || (p.comparePrice ?? 0) > p.price);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((p) => p.name.includes(q.trim()) || p.latinName.toLowerCase().includes(needle) || p.shortDesc.includes(q.trim()));
    }
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "discount": list.sort((a, b) => ((b.comparePrice ?? b.price) - b.price) - ((a.comparePrice ?? a.price) - a.price)); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
    }
    return list;
  }, [initialProducts, dealsOnly, q, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* page head */}
      <div className="mb-10">
        <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-3">STORE</p>
        <h1 className="text-4xl sm:text-5xl font-bold">{dealsOnly ? "عروض اليوم" : "المتجر"}</h1>
        <p className="text-ink-300 mt-3">تراخيص رقمية أصلية بتسليم فوري — {filtered.length} منتجًا</p>
      </div>

      {/* controls */}
      <div className="glass rounded-3xl p-4 mb-8 flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink-300" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث داخل المتجر…"
            className="field !ps-11"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-ink-300" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="field !w-auto bg-ink-850 cursor-pointer"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value} className="bg-ink-850">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* category chips */}
      <div className="flex flex-wrap gap-2.5 mb-10">
        <button
          onClick={() => setParam("c", null)}
          className={cn("rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold transition-all hover:border-neon-400/40", !activeCat ? "chip-active" : "text-ink-200")}
        >
          الكل
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => setParam("c", activeCat === c.slug ? null : c.slug)}
            className={cn("rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold transition-all hover:border-neon-400/40", activeCat === c.slug ? "chip-active" : "text-ink-200")}
          >
            {c.name}
          </button>
        ))}
        <button
          onClick={() => setParam("deals", dealsOnly ? null : "1")}
          className={cn("rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2", dealsOnly ? "bg-lime-pop/15 border-lime-pop/50 text-lime-pop" : "border-white/10 text-ink-200 hover:border-lime-pop/40")}
        >
          <BadgePercent className="w-4 h-4" />
          العروض فقط
        </button>
      </div>

      {/* grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-3xl py-24 text-center">
          <PackageX className="w-12 h-12 text-ink-300 mx-auto mb-4" />
          <p className="font-bold text-lg">لا توجد منتجات مطابقة</p>
          <p className="text-sm text-ink-300 mt-2">جرّب تعديل البحث أو إزالة الفلاتر</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
