import { getBrands } from "@/lib/data";

// Salla-style brand/logo strip rendered on the storefront home.
export default async function BrandsStrip() {
  const brands = await getBrands();
  if (!brands.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-latin text-[11px] tracking-[0.4em] text-neon-400 mb-1">OUR BRANDS</p>
            <h2 className="text-xl sm:text-2xl font-bold">الماركات الرسمية</h2>
          </div>
          <span className="text-xs text-ink-300">{brands.length} ماركة</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {brands.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/3 px-4 py-3 hover:border-neon-400/40 transition-colors"
            >
              {b.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.logo} alt={b.name} className="w-6 h-6 object-contain" />
              ) : (
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-500/30 to-viol-500/30 grid place-items-center text-[10px] font-bold">
                  {b.name[0]}
                </span>
              )}
              <span className="text-sm font-semibold">{b.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
