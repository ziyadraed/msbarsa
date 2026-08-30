"use client";

import { useEffect, useState } from "react";
import { PenLine, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Post = { id: string; title: string; excerpt: string; published: boolean };

export default function BlogPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.blogPosts)) setPosts(s.blogPosts as Post[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { blogPosts: posts } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ منشورات المدونة");
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">المدونة</h2><p className="text-sm text-ink-300 mt-1">اكتب مقالات لتحسين السيو وربط العملاء</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/25 to-amber-400/15 border border-orange-400/30"><PenLine className="w-5 h-5 text-orange-400" /></span>
              <p className="font-bold text-sm">{posts.length} منشور</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {posts.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/10 bg-ink-900/40 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input className={inp + " flex-1"} value={p.title} onChange={(e) => setPosts((arr) => arr.map((y) => y.id === p.id ? { ...y, title: e.target.value } : y))} placeholder="عنوان المقال" />
                  <button type="button" onClick={() => setPosts((arr) => arr.map((y) => y.id === p.id ? { ...y, published: !y.published } : y))} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 ${p.published ? "bg-emerald-400/15 text-emerald-400" : "bg-white/10 text-ink-300"}`}>{p.published ? "منشور" : "مسودة"}</button>
                  <button type="button" onClick={() => setPosts((arr) => arr.filter((y) => y.id !== p.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
                <input className={inp} value={p.excerpt} onChange={(e) => setPosts((arr) => arr.map((y) => y.id === p.id ? { ...y, excerpt: e.target.value } : y))} placeholder="مقتطف المقال" />
              </div>
            ))}
            {posts.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد منشورات</p>}
          </div>
          <button type="button" onClick={() => setPosts((p) => [...p, { id: crypto.randomUUID(), title: "", excerpt: "", published: false }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة منشور
          </button>
        </div>
      )}
    </div>
  );
}
