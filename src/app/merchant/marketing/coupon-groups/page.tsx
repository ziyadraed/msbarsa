"use client";

import { useEffect, useState } from "react";
import { FolderPlus, Loader2, Save, Tag, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

type Coupon = { id: string; code: string; type: string; value: number };
type Group = { id: string; name: string; couponIds: string[] };

export default function CouponGroupsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([
          fetch("/api/merchant/settings").then((r) => r.json()),
          fetch("/api/merchant/coupons").then((r) => r.json()),
        ]);
        const st = s.store?.settings ?? {};
        if (Array.isArray(st.couponGroups)) setGroups(st.couponGroups as Group[]);
        setCoupons(c.coupons ?? []);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  async function persist(next: Group[]) {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { couponGroups: next } }),
      });
      const d = await r.json();
      if (!r.ok) { toast.error(d.error || "تعذر الحفظ"); return false; }
      return true;
    } catch { return false; } finally { setSaving(false); }
  }

  async function addGroup() {
    const n = newName.trim();
    if (!n) return toast.error("اسم المجموعة مطلوب");
    if (groups.some((g) => g.name === n)) return toast.error("المجموعة موجودة");
    const next = [...groups, { id: Date.now().toString(36), name: n, couponIds: [] }];
    const ok = await persist(next);
    if (ok) { setGroups(next); setNewName(""); toast.success("تم إنشاء المجموعة"); }
  }

  async function toggleCoupon(gid: string, cid: string) {
    const next = groups.map((g) => {
      if (g.id !== gid) return g;
      const has = g.couponIds.includes(cid);
      return { ...g, couponIds: has ? g.couponIds.filter((x) => x !== cid) : [...g.couponIds, cid] };
    });
    setGroups(next);
    await persist(next);
  }

  async function removeGroup(id: string) {
    const next = groups.filter((g) => g.id !== id);
    const ok = await persist(next);
    if (ok) { setGroups(next); toast.success("تم الحذف"); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">مجموعات الكوبونات</h2>
        <p className="text-sm text-ink-300 mt-1">نظّم كوبوناتك في مجموعات لسهولة إدارتها — {groups.length} مجموعة</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
      ) : (
        <>
          <div className="flex gap-2 max-w-md">
            <input className="inp flex-1" placeholder="اسم المجموعة (مثال: عملاء جدد)" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGroup()} />
            <button onClick={addGroup} disabled={saving} className="btn-primary rounded-2xl px-5 py-3 text-sm font-bold flex items-center gap-2"><FolderPlus className="w-4 h-4" /> إنشاء</button>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {groups.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center text-ink-300 text-sm col-span-full">لا مجموعات بعد — أنشئ أول مجموعة</div>
            ) : (
              groups.map((g) => (
                <div key={g.id} className="glass rounded-3xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold flex items-center gap-2"><Tag className="w-4 h-4 text-neon-400" /> {g.name}</p>
                    <button onClick={() => removeGroup(g.id)} className="btn-ghost rounded-xl p-2 text-rose-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {coupons.length === 0 && <p className="text-xs text-ink-300">لا كوبونات بعد — أنشئ كوبونات أولًا</p>}
                    {coupons.map((c) => {
                      const on = g.couponIds.includes(c.id);
                      return (
                        <button key={c.id} onClick={() => toggleCoupon(g.id, c.id)} className={`text-[11px] px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${on ? "bg-neon-400/20 text-neon-400 border-neon-400/50" : "bg-white/5 text-ink-300 border-white/10"}`}>
                          <Plus className={`w-3 h-3 ${on ? "rotate-45" : ""}`} /> {c.code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
