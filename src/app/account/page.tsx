"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, KeyRound, Loader2, LogOut, PackageSearch, ShoppingBag, User as UserIcon } from "lucide-react";
import { formatSAR } from "@/lib/utils";

type Order = {
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { productName: string; price: number; licenseKey: string }[];
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me");
        if (!me.ok) throw new Error();
        const u = await me.json();
        setUser(u.user);
        const mo = await fetch("/api/orders/my");
        if (mo.ok) {
          const d = await mo.json();
          setOrders(d.orders ?? []);
        } else {
          setOrders([]);
        }
      } catch {
        setDenied(true);
      }
    })();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("تم تسجيل الخروج");
    router.push("/");
    router.refresh();
  };

  if (denied) {
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center">
        <UserIcon className="w-12 h-12 text-ink-300 mx-auto mb-6" />
        <h1 className="text-3xl font-bold">سجّل الدخول أولًا</h1>
        <p className="text-ink-300 mt-4">صفحة الحساب متاحة للأعضاء المسجلين فقط.</p>
        <Link href="/login" className="btn-primary inline-flex px-8 py-4 rounded-2xl font-bold mt-8">تسجيل الدخول</Link>
      </div>
    );
  }

  if (!user || orders === null) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-10 h-10 animate-spin text-neon-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="glass-strong rounded-3xl p-8 mb-8 flex flex-wrap items-center gap-6">
        <span className="grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-500 to-viol-500 text-ink-950 text-2xl font-bold">
          {user.name[0]}
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-ink-300 font-latin mt-1" dir="ltr">{user.email}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/track" className="btn-ghost rounded-2xl px-5 py-3 text-sm font-semibold flex items-center gap-2">
            <PackageSearch className="w-4 h-4" />
            تتبع طلب قديم
          </Link>
          <button onClick={logout} className="rounded-2xl border border-red-400/30 bg-red-400/10 text-red-300 px-5 py-3 text-sm font-semibold flex items-center gap-2 hover:bg-red-400/15 transition-colors">
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">طلباتي ({orders.length})</h2>

      {orders.length === 0 ? (
        <div className="glass rounded-3xl py-20 text-center">
          <ShoppingBag className="w-11 h-11 text-ink-300 mx-auto mb-5" />
          <p className="font-bold text-lg">لا توجد طلبات بعد</p>
          <p className="text-sm text-ink-300 mt-2 mb-7">طلباتك المسجلة بحسابك ستظهر هنا مع أكوادها.</p>
          <Link href="/shop" className="btn-primary inline-flex px-7 py-3.5 rounded-2xl font-bold text-sm">ابدأ أول عملية شراء</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => (
            <div key={o.orderNumber} className="glass rounded-3xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/8 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4.5 h-4.5 text-neon-400" />
                  <span className="font-bold font-latin">{o.orderNumber}</span>
                  <span className="text-[11px] text-ink-300 font-latin">{new Date(o.createdAt).toLocaleString("en-GB")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 text-[11px] font-bold px-3 py-1">مدفوع</span>
                  <span className="font-latin font-bold text-neon-400">{formatSAR(o.total)}</span>
                </div>
              </div>
              <ul className="divide-y divide-white/6">
                {o.items.map((item, i) => (
                  <li key={i} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{item.productName}</p>
                    <div className="flex items-center gap-2">
                      <code dir="ltr" className="rounded-lg bg-ink-950 border border-white/10 px-3 py-1.5 font-latin text-xs tracking-wider text-neon-400">
                        {item.licenseKey}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.licenseKey);
                          toast.success("تم نسخ الكود");
                        }}
                        className="w-8 h-8 grid place-items-center rounded-lg btn-ghost"
                        aria-label="نسخ"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
