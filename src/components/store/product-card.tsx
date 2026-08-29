"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Zap } from "lucide-react";
import { useCart } from "./cart-provider";
import ProductArt from "./product-art";
import { discountPct, formatSAR } from "@/lib/utils";
import type { Product } from "@/lib/catalog";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const cart = useCart();
  const pct = discountPct(product.price, product.comparePrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group glass rounded-3xl overflow-hidden hover-lift flex flex-col"
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-[16/10] overflow-hidden" aria-label={product.name}>
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.05]">
          <ProductArt category={product.categorySlug} latin={product.latinName} />
        </div>
        {product.badge && (
          <span className="absolute top-3 start-3 z-10 rounded-full bg-ink-950/70 border border-neon-400/40 text-neon-400 text-[10px] font-bold px-3 py-1 backdrop-blur-md">
            {product.badge}
          </span>
        )}
        {pct > 0 && (
          <span className="absolute top-3 end-3 z-10 rounded-full bg-lime-pop text-ink-950 text-[10px] font-bold px-2.5 py-1 font-latin">
            -{pct}%
          </span>
        )}
      </Link>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 text-[11px] text-ink-300">
          <span className="flex items-center gap-1 text-gold">
            <Star className="w-3.5 h-3.5 fill-gold" />
            <span className="font-latin font-semibold">{product.rating.toFixed(1)}</span>
          </span>
          <span className="font-latin">({product.ratingCount})</span>
          <span className="ms-auto flex items-center gap-1 text-emerald-400">
            <Zap className="w-3 h-3" /> تسليم فوري
          </span>
        </div>

        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="font-bold leading-snug group-hover:text-neon-400 transition-colors">{product.name}</h3>
          <p className="text-xs text-ink-300 mt-1.5 leading-relaxed line-clamp-2">{product.shortDesc}</p>
        </Link>

        <div className="mt-auto pt-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-bold text-neon-400 font-latin">{formatSAR(product.price)}</p>
            {product.comparePrice && <p className="text-[11px] text-ink-300 line-through font-latin">{formatSAR(product.comparePrice)}</p>}
          </div>
          <button
            onClick={() =>
              cart.add({
                slug: product.slug,
                name: product.name,
                latinName: product.latinName,
                categorySlug: product.categorySlug,
                price: product.price,
                comparePrice: product.comparePrice,
              })
            }
            className="btn-ghost rounded-2xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 hover:!border-neon-400"
            aria-label={`أضف ${product.name} إلى السلة`}
          >
            <ShoppingBag className="w-4 h-4" />
            أضف
          </button>
        </div>
      </div>
    </motion.div>
  );
}
