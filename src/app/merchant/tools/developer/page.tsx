"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2, Copy, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type ApiKey = { id: string; name: string; token: string; createdAt: string };

export default function DeveloperPage() {
  const [loaded, setLoaded] = useState(false);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newName, setNewName] = useState("");
  const [show, setShow] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.apiKeys)) setKeys(s.apiKeys as ApiKey[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function persist(next: ApiKey[]) {
    await fetch("/api/merchant/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "مسبار", design: { apiKeys: next } }),
    });
  }

  function genToken() {
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function addKey() {
    const n = newName.trim();
    if (!n) return toast.error("أدخل اسم المفتاح");
    const k: ApiKey = { id: Date.now().toString(36), name: n, token: `msp_${genToken()}`, createdAt: new Date().toISOString() };
    const next = [...keys, k];
    setKeys(next);
    await persist(next);
    setNewName("");
    toast.success("تم إنشاء مفتاح API");
  }

  async function removeKey(id: string) {
    const next = keys.filter((k) => k.id !== id);
    setKeys(next);
    await persist(next);
    toast.success("تم حذف المفتاح");
  }

  function copy(tok: string) {
    navigator.clipboard.writeText(tok).then(() => toast.success("تم النسخ"));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">أدوات المطور</h2>
        <p className="text-sm text-ink-300 mt-1">مفاتيح API لدمج متجرك مع أنظمتك الخارجية</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input className="inp flex-1" placeholder="اسم المفتاح (مثال: متجر ووردبريس)" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addKey()} />
            <button onClick={addKey} className="btn-primary rounded-2xl px-5 py-3 text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> إنشاء</button>
          </div>

          {keys.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm">لا مفاتيح API بعد — أنشئ أول مفتاح لدمج المتجر</div>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k.id} className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-sm flex items-center gap-2"><KeyRound className="w-4 h-4 text-neon-400" /> {k.name}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShow(show === k.id ? null : k.id)} className="btn-ghost rounded-xl p-2">{show === k.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      <button onClick={() => copy(k.token)} className="btn-ghost rounded-xl p-2"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => removeKey(k.id)} className="btn-ghost rounded-xl p-2 text-rose-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <code className="block bg-ink-900/60 rounded-xl px-3 py-2 font-latin text-xs text-neon-400 break-all" dir="ltr">
                    {show === k.id ? k.token : `${k.token.slice(0, 10)}••••••••••••`}
                  </code>
                  <p className="text-[10px] text-ink-300 mt-2 font-latin">أُنشئ {new Date(k.createdAt).toLocaleDateString("ar-SA")}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-4 text-xs text-ink-300 leading-7">
            <p className="font-semibold text-ink-100 mb-1">نقطة نهاية الواجهة البرمجية</p>
            <code className="font-latin text-neon-400" dir="ltr">https://msbarsa.vercel.app/api/merchant/products</code>
            <p className="mt-1">أرسل المفتاح في ترويسة <span className="font-latin">Authorization: Bearer &lt;token&gt;</span> للوصول إلى بيانات متجرك.</p>
          </div>
        </div>
      )}
    </div>
  );
}
