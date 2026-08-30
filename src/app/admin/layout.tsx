import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Shield, Store, Users, Boxes, LayoutDashboard, ArrowRight, CreditCard } from "lucide-react";

const NAV = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard, exact: true },
  { href: "/admin/stores", label: "المتاجر", icon: Store },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/plans", label: "الخطط والفوترة", icon: CreditCard },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") redirect("/login");

  return (
    <div className="min-h-screen flex bg-ink-950 text-ink-100">
      <aside className="w-64 shrink-0 border-e border-white/8 bg-ink-900/40 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-5 border-b border-white/8 flex items-center gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-white/10">
            <Shield className="w-5 h-5 text-emerald-400" />
          </span>
          <div>
            <p className="font-bold text-sm leading-tight">مسبار</p>
            <p className="text-[11px] text-ink-300">إدارة المنصة</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-200 hover:bg-white/5 hover:text-ink-100 transition-colors"
            >
              <item.icon className="w-4.5 h-4.5 text-ink-300" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/8">
          <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-ink-300 hover:text-neon-400 transition-colors">
            <ArrowRight className="w-4 h-4" />
            عرض المتجر
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-16 border-b border-white/8 flex items-center justify-between px-6 bg-ink-900/30">
          <h1 className="font-bold text-sm">لوحة إدارة المنصة</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-300 hidden sm:block">{user.name}</span>
            <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-white/10 font-bold text-xs">
              {user.name?.[0] ?? "أ"}
            </span>
          </div>
        </header>
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
