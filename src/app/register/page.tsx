"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Loader2, CircleAlert } from "lucide-react";
import { Logo } from "@/components/store/site-header";

const PERKS = ["حفظ تلقائي لكل طلباتك وأكوادك", "وصول أسرع للدعم بأولوية", "عروض أعضاء حصرية على بريدك"];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "تعذر إنشاء الحساب");
      toast.success("تم إنشاء حسابك بنجاح");
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الحساب");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] grid place-items-center px-4 py-16 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute -top-24 end-1/4 w-96 h-96 bg-viol-500/10 blur-[120px] rounded-full" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center gap-4">
          <Logo compact />
          <div>
            <h1 className="text-3xl font-bold">إنشاء حساب</h1>
            <p className="text-sm text-ink-300 mt-2">دقيقة واحدة تفصلك عن تجربة شراء أذكى</p>
          </div>
          <ul className="flex flex-wrap justify-center gap-2">
            {PERKS.map((p) => (
              <li key={p} className="rounded-full glass px-3.5 py-1.5 text-[11px] text-ink-200">{p}</li>
            ))}
          </ul>
        </div>

        <form onSubmit={submit} className="glass-strong rounded-3xl p-8 space-y-5">
          <div>
            <label className="block text-xs text-ink-300 mb-2">الاسم الكامل</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="محمد العتيبي" required />
          </div>
          <div>
            <label className="block text-xs text-ink-300 mb-2">البريد الإلكتروني</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" dir="ltr" className="field text-left" placeholder="you@email.com" required />
          </div>
          <div>
            <label className="block text-xs text-ink-300 mb-2">كلمة المرور (6 أحرف فأكثر)</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" dir="ltr" className="field text-left" placeholder="••••••••" minLength={6} required />
          </div>
          {error && (
            <div className="rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2.5">
              <CircleAlert className="w-4.5 h-4.5 shrink-0" />
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 disabled:opacity-70">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            {loading ? "جارٍ الإنشاء…" : "إنشاء الحساب"}
          </button>
          <p className="text-center text-sm text-ink-300">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-neon-400 font-semibold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
