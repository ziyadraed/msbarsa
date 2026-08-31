# msbarsa

منصة تجارة إلكترونية عربية قابلة للتوسع، مبنية بـ Next.js وPostgreSQL/Drizzle.

## ما تم تأسيسه

- واجهة متجر عربية RTL للمنتجات الرقمية.
- أساس multi-tenant عبر `storeId` في المستخدمين، المنتجات، الفئات، الطلبات وعناصر الطلب.
- أدوار التاجر: `owner` و`manager` و`admin`، مع عزل API لوحة التاجر عن العملاء.
- لوحة تاجر أولية للكتالوج والطلبات والإحصاءات.
- فحص TypeScript وESLint وBuild عبر GitHub Actions.
- دعم fallback للكتالوج عند تشغيل الواجهة دون قاعدة بيانات في المعاينة.

## التشغيل المحلي

```bash
cp .env.example .env.local
npm install
npm run dev
```

لتجهيز PostgreSQL:

```bash
DB_PASSWORD='ضع-كلمة-مرور-قوية' docker compose up -d db
DATABASE_URL='postgresql://postgres:ضع-كلمة-مرور-قوية@localhost:5432/app_db' npx drizzle-kit push
DATABASE_URL='postgresql://postgres:ضع-كلمة-مرور-قوية@localhost:5432/app_db' npx tsx scripts/seed.ts
```

أضف بريد التاجر في `MERCHANT_EMAILS` أثناء التطوير، أو غيّر دور المستخدم إلى `owner` بعد تسجيله. في الإنتاج طبّق أيضًا ملف `drizzle/0001_multi_tenant_foundation.sql` على قاعدة البيانات الحالية قبل النشر.

## المسارات الجديدة

- `/dashboard` نظرة عامة للتاجر.
- `/dashboard/products` إدارة الكتالوج والمخزون.
- `/dashboard/orders` متابعة الطلبات وحالاتها.

التعديلات التطويرية تتم على فرع منفصل ثم تُفتح كـ Pull Request إلى `main`.

## UI/UX Pro Max و shadcn

تمت تهيئة مشروع Claude Code عبر UI/UX Pro Max في:

```text
.claude/skills/ui-ux-pro-max/
```

لإعادة التهيئة في بيئة لا تحتوي على الأمر العام `uipro` استخدم:

```bash
npx ui-ux-pro-max-cli init --ai claude
```

هيكل shadcn المعتمد في هذا المشروع هو:

```text
components.json
src/components/ui/
src/app/globals.css
```

الاختصار `@/components/ui/*` يشير إلى `src/components/ui/*` عبر `tsconfig.json`. أضيف مكوّن `SparkBadge` إلى هذا المسار، مع صفحة العرض المدمجة داخل `/about`.

## Premium storefront redesign

تم تطوير الواجهة الحالية مباشرة دون تغيير الـ framework أو مسارات الـ business logic. أبرز ما تم توحيده:

- Light premium commerce surface مع dark cinematic hero/campaign islands.
- Header sticky مع search overlay وmobile sheet وحالات scroll واضحة.
- Hero سينمائي مع visual WebGL الحالي، تحريك دخول، mouse glow اختياري، counters، وbrand marquee متصل.
- Product cards وProductArt وShop controls وProduct detail وCart Drawer بتصميم موحد.
- Campaign banner، process steps، trust features، reviews snap-scroll على الهاتف، وFAQ قابل للوصول.
- Footer بمجموعات روابط ونشرة بريدية ومؤشرات طرق الدفع.
- التصميم يحترم `prefers-reduced-motion` ويحافظ على بيانات المنتجات الحقيقية ومسار السلة والدفع والحساب.
