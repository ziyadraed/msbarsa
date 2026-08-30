import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import MerchantSidebar from "@/components/merchant/sidebar";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "merchant" && user.role !== "admin")) redirect("/login");

  return (
    <div className="min-h-screen flex bg-ink-950 text-ink-100">
      <MerchantSidebar />

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/8">
        <p className="font-bold">لوحة التاجر</p>
        <Link href="/" className="text-sm text-neon-400">المتجر</Link>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="h-16 border-b border-white/8 flex items-center justify-between px-6 bg-ink-900/30">
          <div>
            <h1 className="font-bold text-sm">مسبار للتاجر</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-300 hidden sm:block">{user.name}</span>
            <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-to-br from-neon-500/30 to-viol-500/30 border border-white/10 font-bold text-xs">
              {user.name?.[0] ?? "م"}
            </span>
          </div>
        </header>
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
