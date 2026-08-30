import { requireRole } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  await requireRole(["admin"], "/login");
  const plans = [
    { name: "مجاني", price: 0, features: "متجر واحد · منتجات محدودة · دعم أساسي" },
    { name: "Plus", price: 59, features: "متجر واحد · منتجات غير محدودة · تحليلات" },
    { name: "Pro", price: 149, features: "متاجر متعددة · أتمتة · تقارير متقدمة" },
    { name: "Enterprise", price: "تواصل معنا", features: "حلول مخصصة · POS · دعم مخصص" },
  ];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">الخطط والفوترة</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => (
          <div key={p.name} className="glass rounded-3xl p-6 hover-lift">
            <p className="font-bold">{p.name}</p>
            <p className="font-latin text-2xl font-bold mt-2">{p.price === 0 ? "مجاني" : `${p.price} ر.س`}</p>
            <p className="text-xs text-ink-300 mt-3 leading-6">{p.features}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
