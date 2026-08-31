"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ShoppingBag, Zap, Minus, Plus, Check, ShieldCheck, RefreshCcw, Headset, ChevronLeft } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";
import ProductArt from "@/components/store/product-art";
import ProductCard from "@/components/store/product-card";
import { discountPct, formatSAR } from "@/lib/utils";
import type { Category, Product } from "@/lib/catalog";

export default function ProductView({ product, category, related }: { product: Product; category?: Category; related: Product[] }) {
  const cart = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const pct = discountPct(product.price, product.comparePrice);
  const outOfStock = product.stock <= 0;
  const available = Math.max(0, product.stock);

  const addAndGo = (go: boolean) => {
    if (outOfStock) return;
    cart.add(
      {
        slug: product.slug,
        name: product.name,
        latinName: product.latinName,
        categorySlug: product.categorySlug,
        price: product.price,
        comparePrice: product.comparePrice,
      },
      qty
    );
    if (go) router.push("/checkout");
    else cart.setOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-ink-300 mb-8 flex-wrap">
        <Link href="/" className="hover:text-neon-400">الرئيسية</Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/shop" className="hover:text-neon-400">المتجر</Link>
        {category && (
          <>
            <ChevronLeft className="w-3.5 h-3.5" />
            <Link href={`/shop?c=${category.slug}`} className="hover:text-neon-400">{category.name}</Link>
          </>
        )}
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-ink-100">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* visual */}
        <div className="relative rounded-[2rem] overflow-hidden border border-white/10 aspect-[4/3] lg:sticky lg:top-28">
          <ProductArt category={product.categorySlug} latin={product.latinName} size="lg" />
          {product.badge && (
            <span className="absolute top-4 start-4 rounded-full bg-ink-950/70 border border-neon-400/40 text-neon-400 text-xs font-bold px-4 py-1.5 backdrop-blur-md">
              {product.badge}
            </span>
          )}
          {pct > 0 && (
            <span className="absolute top-4 end-4 rounded-full bg-lime-pop text-ink-950 text-xs font-bold px-3 py-1.5 font-latin">-{pct}%</span>
          )}
        </div>

        {/* info */}
        <div>
          <div className="flex items-center gap-3 text-xs text-ink-300 mb-4">
            <span className="font-latin tracking-[0.25em]">{product.latinName}</span>
            <span className="w-1 h-1 rounded-full bg-ink-300" />
            <span className="flex items-center gap-1 text-gold">
              <Star className="w-3.5 h-3.5 fill-gold" />
              <span className="font-latin">{product.rating.toFixed(1)}</span>
              <span className="text-ink-300">({product.ratingCount} تقييم)</span>
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">{product.name}</h1>
          <p className="mt-5 text-ink-300 leading-8">{product.longDesc}</p>

          {/* price */}
          <div className="mt-8 glass rounded-3xl p-6">
            <div className="flex flex-wrap items-end gap-4">
              <span className="text-5xl font-bold font-latin text-neon-400">{formatSAR(product.price)}</span>
              {product.comparePrice && (
                <span className="text-lg text-ink-300 line-through font-latin mb-1.5">{formatSAR(product.comparePrice)}</span>
              )}
              <span className="mb-1.5 ms-auto flex items-center gap-1.5 text-xs text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                تسليم فوري خلال دقائق
              </span>
            </div>

            {outOfStock ? (
              <div className="mt-6 rounded-2xl border border-red-400/40 bg-red-400/10 px-5 py-4 text-sm font-semibold text-red-300 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                نفد المخزون — هذا المنتج غير متاح حاليًا. تابع معنا أو اختر منتجًا مشابهًا.
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1 rounded-2xl border border-white/12 overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-12 grid place-items-center hover:bg-white/5" aria-label="تقليل الكمية">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-11 text-center font-latin font-bold">{qty}</span>
                  <button onClick={() => setQty(Math.min(available, qty + 1))} className="w-11 h-12 grid place-items-center hover:bg-white/5" aria-label="زيادة الكمية">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {available > 0 && (
                  <span className="text-xs text-ink-300">
                    <span className="font-bold text-ink-100 font-latin">{available}</span> متوفر في المخزون
                  </span>
                )}
                <button onClick={() => addAndGo(false)} className="btn-ghost rounded-2xl px-6 py-3.5 font-bold flex items-center gap-2 flex-1 justify-center sm:flex-none">
                  <ShoppingBag className="w-4.5 h-4.5" />
                  أضف إلى السلة
                </button>
                <button onClick={() => addAndGo(true)} className="btn-primary rounded-2xl px-6 py-3.5 font-bold flex-1 sm:flex-none">
                  اشترِ الآن
                </button>
              </div>
            )}
          </div>

          {/* specs */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { l: "نوع الترخيص", v: product.licenseType },
              { l: "الأجهزة", v: product.devices },
              { l: "المدة", v: product.duration },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-4 text-center">
                <p className="text-[11px] text-ink-300 mb-1.5">{s.l}</p>
                <p className="text-sm font-bold">{s.v}</p>
              </div>
            ))}
          </div>

          {/* features */}
          <div className="mt-8">
            <h2 className="font-bold text-lg mb-4">أبرز المزايا</h2>
            <ul className="space-y-3">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink-200">
                  <span className="mt-0.5 grid place-items-center w-5 h-5 rounded-full bg-emerald-400/15 text-emerald-400 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* guarantees */}
          <div className="mt-8 grid sm:grid-cols-3 gap-3 text-[12px]">
            {[
              { icon: ShieldCheck, t: "ضمان استبدال 30 يومًا" },
              { icon: RefreshCcw, t: "استرجاع كامل عند عدم التفعيل" },
              { icon: Headset, t: "مساعدة مجانية في التفعيل" },
            ].map((g) => (
              <div key={g.t} className="flex items-center gap-2.5 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-ink-200">
                <g.icon className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                {g.t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* activation guide */}
      <div className="mt-20 glass rounded-[2rem] p-8 lg:p-12">
        <h2 className="text-2xl font-bold mb-8 text-center">كيف يصلك المنتج ويتم تفعيله؟</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "١", t: "أكمل طلبك", d: "أدخل بريدك الإلكتروني بدقة — إليه تُرسل نسخة من مفاتيحك وفاتورتك." },
            { n: "٢", t: "استلم المفتاح فورًا", d: "تظهر أدوات التفعيل في صفحة التأكيد مباشرة، وتبقى متاحة عبر «تتبع الطلب» مدى الحياة." },
            { n: "٣", t: "فعّل وابدأ العمل", d: "اتبع الدليل المصور المرفق، وإن احتجت مساعدة ففريق الدعم معك خطوة بخطوة مجانًا." },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <span className="mx-auto mb-5 grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-500/25 to-viol-500/20 border border-neon-400/30 text-neon-400 text-xl font-bold">
                {s.n}
              </span>
              <h3 className="font-bold mb-2.5">{s.t}</h3>
              <p className="text-sm text-ink-300 leading-7">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-8">منتجات قد تعجبك</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.slice(0, 4).map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
