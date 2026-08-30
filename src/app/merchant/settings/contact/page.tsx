"use client";

import { useEffect, useState } from "react";
import { AtSign, Loader2, Save, Phone } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: "", phone: "", whatsapp: "", instagram: "", twitter: "", snapchat: "", tiktok: "", telegram: "",
  });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      if (d.store) {
        const s = d.store.settings ?? {};
        setForm({
          email: String(d.store.email ?? ""),
          phone: String(d.store.phone ?? ""),
          whatsapp: String(s.whatsapp ?? ""),
          instagram: String(s.instagram ?? ""),
          twitter: String(s.twitter ?? ""),
          snapchat: String(s.snapchat ?? ""),
          tiktok: String(s.tiktok ?? ""),
          telegram: String(s.telegram ?? ""),
        });
      }
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "مسبار",
          email: form.email,
          phone: form.phone,
          design: {
            whatsapp: form.whatsapp,
            instagram: form.instagram,
            twitter: form.twitter,
            snapchat: form.snapchat,
            tiktok: form.tiktok,
            telegram: form.telegram,
          },
        }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ بيانات التواصل");
    } finally {
      setSaving(false);
    }
  }

  const socials = [
    { key: "instagram", label: "انستغرام" },
    { key: "twitter", label: "إكس / تويتر" },
    { key: "snapchat", label: "سناب شات" },
    { key: "tiktok", label: "تيك توك" },
    { key: "telegram", label: "تيليغرام" },
    { key: "whatsapp", label: "واتساب (رقم)" },
  ] as const;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">بيانات المتجر وقنوات التواصل</h2>
        <p className="text-sm text-ink-300 mt-1">بيانات التواصل وحساباتك على منصات التواصل</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5 flex items-center gap-1"><AtSign className="w-3.5 h-3.5" /> البريد</span>
              <input className="inp font-latin" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> الجوال</span>
              <input className="inp font-latin" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="font-bold text-sm mb-3">منصات التواصل</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {socials.map((s) => (
                <label key={s.key} className="block">
                  <span className="block text-xs text-ink-300 mb-1.5">{s.label}</span>
                  <input className="inp font-latin" dir="ltr" value={form[s.key]} onChange={(e) => setForm({ ...form, [s.key]: e.target.value })} placeholder={s.key === "whatsapp" ? "+9665..." : "@username"} />
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
