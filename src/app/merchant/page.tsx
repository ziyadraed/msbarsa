import { requireRole } from "@/lib/guard";
import { getStoreStats, getLatestOrders, getBestSellers, getOrdersByStatus } from "@/lib/dash";
import { getStoreBySlug } from "@/lib/tenant";
import { formatSAR } from "@/lib/utils";
import { Wallet, ShoppingBag, Users, Package, AlertTriangle, ArrowLeft, TrendingUp, Store } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  paid: "مدفوع",
  awaiting_payment: "بانتظار الدفع",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export default async function MerchantDashboardPage() {
  const { user, storeId } = await requireRole(["merchant", "admin"], "/login");
  const store = storeId ? await getStoreBySlug("msbarsa") : null;

  // If no store linked yet, show onboarding empty state.
  if (!storeId) {
    return (
      <div className="rounded-3xl glass p-10 text-center max-w-lg mx-auto mt-10">
        <span className="mx-auto grid place-items-center w-16 h-16 rounded-3xl bg-gradient-to-br from-neon-500/25 to-viol-500/20 border border-neon-400/30 mb-5">
          <Store className="w-8 h-8 text-neon-400" />
        </span>
        <h2 className="text-xl font-bold mb-2">أنشئ متجرك للبدء</h2>
        <p className="text-sm text-ink-300 leading-7">أنت الآن تاجر بدون متجر. أنشئ متجرك من إعدادات الحساب للبدء في إدارة منتجاتك وطلباتك.</p>
        <Link href="/merchant/settings" className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold mt-6">
          إعداد المتجر
        </Link>
      </div>
    );
  }

  const [stats, latestOrders, bestSellers, byStatus] = await Promise.all([
    getStoreStats(storeId),
    getLatestOrders(storeId, 6),
    getBestSellers(storeId, 5),
    getOrdersByStatus(storeId),
  ]);

  const cards = [
    { label: "إجمالي المبيعات", value: formatSAR(stats.revenue), icon: Wallet, tint: "text-neon-400 bg-neon-400/10 border-neon-400/25" },
    { label: "عدد الطلبات", value: String(stats.orderCount), icon: ShoppingBag, tint: "text-viol-400 bg-viol-500/10 border-viol-500/25" },
    { label: "العملاء", value: String(stats.customerCount), icon: Users, tint: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25" },
    { label: "المنتجات", value: String(stats.productCount), icon: Package, tint: "text-amber-400 bg-amber-500/10 border-amber-400/25" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">مرحبًا، {user.name} 👋</h2>
          <p className="text-sm text-ink-300 mt-1">إليك نظرة عامة على أداء متجرك {store?.name ?? ""}</p>
        </div>
        <Link href="/merchant/orders" className="btn-ghost rounded-2xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2">
          كل الطلبات
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-3xl p-5 hover-lift">
            <span className={`grid place-items-center w-11 h-11 rounded-2xl border ${c.tint} mb-4`}>
              <c.icon className="w-5 h-5" />
            </span>
            <p className="font-latin font-bold text-2xl">{c.value}</p>
            <p className="text-xs text-ink-300 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Latest orders */}
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold">أحدث الطلبات</h3>
            <span className="text-[11px] text-ink-300">{latestOrders.length} طلب</span>
          </div>
          {latestOrders.length === 0 ? (
            <Empty text="لا توجد طلبات بعد — شارك متجرك وابدأ البيع" />
          ) : (
            <div className="divide-y divide-white/5">
              {latestOrders.map((o) => (
                <div key={o.id} className="py-3 flex items-center gap-4">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 font-latin text-xs font-bold text-neon-400">
                    {o.orderNumber.replace("MB-", "#")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{o.customerName}</p>
                    <p className="text-[11px] text-ink-300">
                      {new Date(o.createdAt).toLocaleDateString("ar-SA")} · {o.email}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                  <span className="font-latin font-bold text-sm">{formatSAR(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Status distribution */}
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold mb-4">حالة الطلبات</h3>
            {byStatus.length === 0 ? (
              <Empty text="لا بيانات بعد" />
            ) : (
              <div className="space-y-3">
                {byStatus.map((s) => (
                  <div key={s.status} className="flex items-center gap-3">
                    <span className="flex-1 text-xs text-ink-300">{STATUS_LABEL[s.status] ?? s.status}</span>
                    <span className="font-latin text-sm font-bold">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Best sellers */}
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-400" /> الأكثر مبيعًا
            </h3>
            {bestSellers.length === 0 ? (
              <Empty text="لا مبيعات بعد" />
            ) : (
              <div className="space-y-3">
                {bestSellers.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="font-latin text-xs text-ink-300 w-4">{i + 1}</span>
                    <span className="flex-1 text-xs font-semibold truncate">{p.name}</span>
                    <span className="font-latin text-xs text-neon-400">{p.qty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inventory alerts */}
      {stats.lowStock.length > 0 && (
        <div className="rounded-3xl border border-amber-400/25 bg-amber-500/5 p-6">
          <h3 className="font-bold flex items-center gap-2 text-amber-300 mb-4">
            <AlertTriangle className="w-5 h-5" /> تنبيهات المخزون المنخفض
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span className="text-xs font-semibold truncate">{p.name}</span>
                <span className="font-latin text-xs text-amber-300 shrink-0">{p.stock} متبقٍ</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-ink-300 py-6 text-center">{text}</p>;
}
