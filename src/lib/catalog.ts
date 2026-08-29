export type Category = {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  tint: string;
  sort: number;
};

export type Product = {
  id: string;
  slug: string;
  categorySlug: string;
  name: string;
  latinName: string;
  shortDesc: string;
  longDesc: string;
  features: string[];
  licenseType: string;
  devices: string;
  duration: string;
  price: number;
  comparePrice: number | null;
  rating: number;
  ratingCount: number;
  badge: string | null;
  isDeal: boolean;
  stock: number;
  sort: number;
};

export const CATEGORIES: Category[] = [
  { slug: "windows", name: "أنظمة ويندوز", tagline: "تراخيص Windows أصلية بخيارات Home و Pro", icon: "layout-grid", tint: "cyan", sort: 1 },
  { slug: "office", name: "أوفيس و Microsoft 365", tagline: "حزم الإنتاجية Word و Excel و PowerPoint", icon: "file-text", tint: "amber", sort: 2 },
  { slug: "server", name: "ويندوز سيرفر", tagline: "حلول Windows Server للشركات والمؤسسات", icon: "server", tint: "teal", sort: 3 },
  { slug: "adobe", name: "أدوبي الإبداعية", tagline: "اشتراكات Adobe للتصميم والمونتاج", icon: "pen-tool", tint: "magenta", sort: 4 },
  { slug: "security", name: "برامج الحماية", tagline: "مضادات فيروسات معتمدة لحماية أجهزتك", icon: "shield-check", tint: "emerald", sort: 5 },
  { slug: "autodesk", name: "أوتوديسك", tagline: "أدوات الهندسة والتصميم ثلاثي الأبعاد", icon: "drafting-compass", tint: "violet", sort: 6 },
];

export const PRODUCTS: Product[] = [
  {
    id: "p-w11pro", slug: "windows-11-pro", categorySlug: "windows",
    name: "ويندوز 11 برو", latinName: "Windows 11 Pro",
    shortDesc: "مفتاح ترخيص رقمي أصلي لتفعيل نسخة Professional بكامل مزاياها.",
    longDesc: "نسخة الأعمال الأشهر من نظام التشغيل: واجهة حديثة، أداء محسّن للألعاب والعمل، دعم BitLocker لتشفير البيانات، والانضمام للنطاقات وإدارة الأجهزة. يصلك مفتاح الترخيص خلال دقائق من إتمام الطلب مع دليل تفعيل مصور خطوة بخطوة.",
    features: ["تفعيل رسمي عبر الإنترنت", "تحديثات النظام كاملة مدى الحياة", "دعم BitLocker وسطح المكتب البعيد", "إمكانية إعادة التثبيت على نفس الجهاز", "دليل تفعيل مصوّر بالعربية"],
    licenseType: "Retail", devices: "جهاز واحد", duration: "مدى الحياة",
    price: 199, comparePrice: 649, rating: 4.9, ratingCount: 1240, badge: "الأكثر مبيعًا", isDeal: true, stock: 999, sort: 1,
  },
  {
    id: "p-w11home", slug: "windows-11-home", categorySlug: "windows",
    name: "ويندوز 11 هوم", latinName: "Windows 11 Home",
    shortDesc: "الخيار المثالي للاستخدام المنزلي بتفعيل دائم وسريع.",
    longDesc: "كل ما يحتاجه جهازك المنزلي: واجهة سلسة، متجر تطبيقات مدمج، حماية Windows Security افتراضيًا، وأداء ممتاز للتصفح والترفيه والدراسة. المفتاح يصلك فورًا بعد الدفع لتفعيله خلال دقيقة واحدة.",
    features: ["تفعيل رسمي عبر الإنترنت", "تحديثات مدى الحياة", "أنسب نسخة للاستخدام اليومي", "دليل تفعيل مصوّر بالعربية"],
    licenseType: "Retail", devices: "جهاز واحد", duration: "مدى الحياة",
    price: 159, comparePrice: 549, rating: 4.8, ratingCount: 860, badge: null, isDeal: false, stock: 999, sort: 2,
  },
  {
    id: "p-w10pro", slug: "windows-10-pro", categorySlug: "windows",
    name: "ويندوز 10 برو", latinName: "Windows 10 Pro",
    shortDesc: "استقرار وثبات مثبتان للأجهزة المكتبية وأجهزة العمل.",
    longDesc: "ما زال ويندوز 10 برو الخيار الأثبت لكثير من الشركات والمستخدمين. ترخيص رقمي دائم مع كامل مزايا النسخة الاحترافية من إدارة الأجهزة إلى التشفير، مع تحديثات الأمان المستمرة طوال فترة دعم النظام.",
    features: ["تفعيل رسمي عبر الإنترنت", "مزايا Pro الكاملة", "متوافق مع الأجهزة القديمة", "دليل تفعيل مصوّر بالعربية"],
    licenseType: "Retail", devices: "جهاز واحد", duration: "مدى الحياة",
    price: 119, comparePrice: 449, rating: 4.8, ratingCount: 640, badge: null, isDeal: false, stock: 999, sort: 3,
  },
  {
    id: "p-w10home", slug: "windows-10-home", categorySlug: "windows",
    name: "ويندوز 10 هوم", latinName: "Windows 10 Home",
    shortDesc: "تفعيل دائم اقتصادي للأجهزة المنزلية والدراسة.",
    longDesc: "حل اقتصادي لتفعيل جهازك برخصة أصلية دائمة. مناسب للدراسة والاستخدام اليومي، مع نفس تجربة ويندوز 10 المستقرة التي تعرفها الأجهزة حول العالم.",
    features: ["تفعيل رسمي عبر الإنترنت", "سعر اقتصادي", "مناسب للأجهزة الشخصية", "دليل تفعيل مصوّر بالعربية"],
    licenseType: "Retail", devices: "جهاز واحد", duration: "مدى الحياة",
    price: 99, comparePrice: 399, rating: 4.7, ratingCount: 412, badge: null, isDeal: false, stock: 999, sort: 4,
  },
  {
    id: "p-off21", slug: "office-2021-pro-plus", categorySlug: "office",
    name: "أوفيس 2021 بروفيشنال بلس", latinName: "Office 2021 Pro Plus",
    shortDesc: "الحزمة الكاملة Word و Excel و PowerPoint و Outlook بترخيص دائم.",
    longDesc: "أشهر حزمة إنتاجية على الإطلاق بترخيص دائم يعمل مدى الحياة دون اشتراكات شهرية. تشمل Word و Excel و PowerPoint و Outlook و OneNote و Teams و Publisher و Access. تفعيل مباشر خلال دقائق على جهازك.",
    features: ["٨ تطبيقات كاملة بترخيص دائم", "بدون رسوم شهرية أو سنوية", "يعمل دون اتصال بالإنترنت", "دليل تفعيل مصوّر بالعربية", "ضمان استبدال فوري"],
    licenseType: "Retail", devices: "جهاز واحد", duration: "مدى الحياة",
    price: 289, comparePrice: 1499, rating: 5.0, ratingCount: 2130, badge: "الأعلى تقييمًا", isDeal: true, stock: 999, sort: 1,
  },
  {
    id: "p-off24hb", slug: "office-2024-home-business", categorySlug: "office",
    name: "أوفيس 2024 للمنزل والأعمال", latinName: "Office 2024 Home & Business",
    shortDesc: "أحدث إصدار دائم من حزمة أوفيس بواجهة محدثة.",
    longDesc: "أحدث إصدارات الحزمة المكتبية الدائمة: تحسينات في الأداء، أدوات تحليل بيانات أذكى في Excel، وتصميم محدث عبر جميع التطبيقات. ترخيص دائم لجهاز واحد دون أي اشتراك.",
    features: ["أحدث إصدار دائم", "Word و Excel و PowerPoint و Outlook", "بدون اشتراكات", "دليل تفعيل مصوّر بالعربية"],
    licenseType: "Retail", devices: "جهاز واحد", duration: "مدى الحياة",
    price: 449, comparePrice: 899, rating: 4.9, ratingCount: 380, badge: "جديد", isDeal: false, stock: 999, sort: 2,
  },
  {
    id: "p-m365p", slug: "microsoft-365-personal", categorySlug: "office",
    name: "مايكروسوفت 365 شخصي — سنة", latinName: "Microsoft 365 Personal",
    shortDesc: "اشتراك سنوي مع 1TB تخزين OneDrive وأحدث المزايا أولًا بأول.",
    longDesc: "اشتراك مرن لمستخدم واحد: تطبيقات أوفيس دائمة التحديث على 5 أجهزة في نفس الوقت، مع مساحة تخزين سحابية 1TB على OneDrive الآمنة ومزايا Copilot الذكية في التطبيقات المدعومة.",
    features: ["تثبيت على 5 أجهزة لمستخدم واحد", "مساحة OneDrive سعة 1TB", "تحديثات مستمرة طوال الاشتراك", "يعمل على ويندوز وماك والجوال"],
    licenseType: "اشتراك رسمي", devices: "5 أجهزة / مستخدم", duration: "12 شهرًا",
    price: 229, comparePrice: 399, rating: 4.8, ratingCount: 520, badge: null, isDeal: false, stock: 999, sort: 3,
  },
  {
    id: "p-m365f", slug: "microsoft-365-family", categorySlug: "office",
    name: "مايكروسوفت 365 عائلي — سنة", latinName: "Microsoft 365 Family",
    shortDesc: "حتى 6 مستخدمين و 6TB تخزين سحابي في اشتراك واحد.",
    longDesc: "الأفضل قيمة للعائلات: اشتراك واحد يغطي 6 مستخدمين، وكل مستخدم يحصل على تطبيقات أوفيس الكاملة على أجهزته الخمسة ومساحة OneDrive مستقلة سعة 1TB.",
    features: ["حتى 6 مستخدمين مستقلين", "إجمالي 6TB تخزين OneDrive", "أدوات رقابة أبوية عبر Family Safety", "يعمل على كل الأنظمة"],
    licenseType: "اشتراك رسمي", devices: "حتى 30 جهازًا / 6 مستخدمين", duration: "12 شهرًا",
    price: 319, comparePrice: 549, rating: 4.9, ratingCount: 445, badge: "قيمة ممتازة", isDeal: true, stock: 999, sort: 4,
  },
  {
    id: "p-srv22std", slug: "windows-server-2022-standard", categorySlug: "server",
    name: "ويندوز سيرفر 2022 ستاندرد", latinName: "Windows Server 2022 Standard",
    shortDesc: "نظام خوادم حديث بطبقات أمان متقدمة ودعم Azure المدمج.",
    longDesc: "إصدار Standard من نظام الخوادم الأحدث: أمان متعدد الطبقات، دعم الحاويات، تحسينات الشبكات، وتكامل هجين مع Azure. مناسب للشركات الصغيرة والمتوسطة وبيئات الأجهزة الافتراضية المحدودة.",
    features: ["تفعيل رسمي دائم", "أمان متعدد الطبقات Secured-Core", "تكامل هجين مع Azure", "دعم فني لتوجيه التثبيت"],
    licenseType: "Retail", devices: "خادم واحد (16 Core)", duration: "مدى الحياة",
    price: 1499, comparePrice: 3299, rating: 4.9, ratingCount: 146, badge: null, isDeal: false, stock: 100, sort: 1,
  },
  {
    id: "p-srv22dc", slug: "windows-server-2022-datacenter", categorySlug: "server",
    name: "ويندوز سيرفر 2022 داتاسنتر", latinName: "Windows Server 2022 Datacenter",
    shortDesc: "أجهزة افتراضية غير محدودة ومزايا Software-Defined كاملة.",
    longDesc: "الإصدار الأعلى لبيئات المؤسسات ومراكز البيانات: عدد غير محدود من الأجهزة الافتراضية والحاويات، مع Storage Spaces Direct وشبكات SDN الكاملة. الخيار الصحيح لمن يبني بنية تحتية احترافية.",
    features: ["أجهزة افتراضية بلا حدود", "Storage Spaces Direct و SDN", "Shielded Virtual Machines", "دعم فني لتوجيه التثبيت"],
    licenseType: "Retail", devices: "خادم واحد (16 Core)", duration: "مدى الحياة",
    price: 4999, comparePrice: 14999, rating: 5.0, ratingCount: 62, badge: "للمؤسسات", isDeal: false, stock: 50, sort: 2,
  },
  {
    id: "p-srv19std", slug: "windows-server-2019-standard", categorySlug: "server",
    name: "ويندوز سيرفر 2019 ستاندرد", latinName: "Windows Server 2019 Standard",
    shortDesc: "إصدار مجرّب ومستقر ما زال يخدم آلاف الشركات حول العالم.",
    longDesc: "خيار موثوق لبيئات العمل القائمة على إصدار 2019: استقرار مثبت، دعم واسع للتطبيقات المؤسسية، وترخيص دائم بسعر تنافسي.",
    features: ["تفعيل رسمي دائم", "استقرار مثبت في بيئات الإنتاج", "توافق واسع مع التطبيقات", "دعم فني لتوجيه التثبيت"],
    licenseType: "Retail", devices: "خادم واحد (16 Core)", duration: "مدى الحياة",
    price: 1199, comparePrice: 2899, rating: 4.8, ratingCount: 118, badge: null, isDeal: false, stock: 80, sort: 3,
  },
  {
    id: "p-adobecc", slug: "adobe-cc-all-apps", categorySlug: "adobe",
    name: "أدوبي كرييتف كلاود — كل التطبيقات", latinName: "Creative Cloud All Apps",
    shortDesc: "أكثر من 20 تطبيقًا إبداعيًا باشتراك 12 شهرًا.",
    longDesc: "باقة المصممين الكاملة: Photoshop و Illustrator و Premiere Pro و After Effects و InDesign وأكثر من 20 تطبيقًا مع 100GB تخزين سحابي وخطوط Adobe Fonts ومكتبة Stock المجانية للأصول الأساسية.",
    features: ["أكثر من 20 تطبيقًا كاملًا", "100GB تخزين سحابي", "وصول لخطوط Adobe Fonts", "تحديثات فورية لكل الإصدارات الجديدة"],
    licenseType: "اشتراك رسمي", devices: "جهازان / مستخدم", duration: "12 شهرًا",
    price: 1899, comparePrice: 2899, rating: 4.9, ratingCount: 310, badge: null, isDeal: true, stock: 200, sort: 1,
  },
  {
    id: "p-ps", slug: "adobe-photoshop", categorySlug: "adobe",
    name: "أدوبي فوتوشوب — 12 شهرًا", latinName: "Adobe Photoshop",
    shortDesc: "معيار الصناعة لتحرير الصور والتصميم الرقمي.",
    longDesc: "اشتراك سنوي في أشهر برنامج لتحرير الصور في العالم: أدوات الذكاء الاصطناعي Generative Fill، فلاتر عصبية، وتحرير طبقي احترافي للمصورين والمصممين وصنّاع المحتوى.",
    features: ["أدوات الذكاء الاصطناعي الحديثة", "يشتمل على Lightroom للصور", "100GB تخزين سحابي", "تحديثات مستمرة"],
    licenseType: "اشتراك رسمي", devices: "جهازان / مستخدم", duration: "12 شهرًا",
    price: 749, comparePrice: 1099, rating: 4.8, ratingCount: 265, badge: null, isDeal: false, stock: 200, sort: 2,
  },
  {
    id: "p-ai", slug: "adobe-illustrator", categorySlug: "adobe",
    name: "أدوبي إليستريتور — 12 شهرًا", latinName: "Adobe Illustrator",
    shortDesc: "التصميم المتجهي الاحترافي للشعارات والهويات البصرية.",
    longDesc: "الأداة الأولى عالميًا للرسم المتجهي: شعارات، هويات بصرية، رسوم توضيحية، وتجهيزات طباعة بدقة لا نهائية. اشتراك سنوي كامل مع المزامنة السحابية.",
    features: ["دقة متجهية بلا حدود", "مكتبات Creative Cloud المشتركة", "قوالب وأصول جاهزة", "تحديثات مستمرة"],
    licenseType: "اشتراك رسمي", devices: "جهازان / مستخدم", duration: "12 شهرًا",
    price: 749, comparePrice: 1099, rating: 4.8, ratingCount: 198, badge: null, isDeal: false, stock: 200, sort: 3,
  },
  {
    id: "p-kasper", slug: "kaspersky-premium", categorySlug: "security",
    name: "كاسبرسكاي بريميوم — جهاز واحد", latinName: "Kaspersky Premium",
    shortDesc: "حماية شاملة من الفيروسات وبرامج الفدية وعمليات الاحتيال.",
    longDesc: "أعلى باقة حماية من كاسبرسكاي لجهازك لمدة سنة كاملة: درع فوري ضد الفيروسات وبرامج الفدية، حماية للمدفوعات البنكية، مدير كلمات مرور، وVPN بلا حدود مع دعم فني مباشر.",
    features: ["حماية فورية متعددة الطبقات", "VPN غير محدود البيانات", "مدير كلمات مرور مدمج", "حماية التسوق والمدفوعات"],
    licenseType: "اشتراك رسمي", devices: "جهاز واحد", duration: "12 شهرًا",
    price: 89, comparePrice: 199, rating: 4.8, ratingCount: 540, badge: "الأكثر مبيعًا", isDeal: true, stock: 999, sort: 1,
  },
  {
    id: "p-mcafee", slug: "mcafee-total-protection", categorySlug: "security",
    name: "مكافي توتال بروتكشن — 5 أجهزة", latinName: "McAfee Total Protection",
    shortDesc: "درع واحد يحمي 5 أجهزة: جوال، حاسب، وجهاز لوحي.",
    longDesc: "حماية عائلية متكاملة لخمسة أجهزة مهما كان نظامها: مضاد فيروسات حائز على جوائز، حماية للهوية، جدار ناري ذكي، وأدوات لتحسين أداء الأجهزة وتنظيفها.",
    features: ["يغطي 5 أجهزة بنظام واحد", "حماية الهوية وتنبيهات الاختراق", "جدار ناري وحماية شبكة Wi-Fi", "أدوات تحسين الأداء"],
    licenseType: "اشتراك رسمي", devices: "5 أجهزة", duration: "12 شهرًا",
    price: 119, comparePrice: 349, rating: 4.7, ratingCount: 388, badge: null, isDeal: false, stock: 999, sort: 2,
  },
  {
    id: "p-eset", slug: "eset-home-security", categorySlug: "security",
    name: "ESET هوم سيكيوريتي — سنتان", latinName: "ESET Home Security",
    shortDesc: "خفيف على الجهاز، قوي على التهديدات — لسنتين كاملتين.",
    longDesc: "اشتراك سنتين في حماية ESET الشهيرة بخفتها وقوتها: لا يبطئ الألعاب أو العمل، مع حماية متقدمة من برامج الفدية والتصيد وكاميرا الويب، ودعم للأجهزة المتعددة.",
    features: ["سنتان كاملتان من الحماية", "أخف أداء على موارد الجهاز", "حماية كاميرا الويب والميكروفون", "وضع الألعاب الصامت"],
    licenseType: "اشتراك رسمي", devices: "جهاز واحد", duration: "24 شهرًا",
    price: 149, comparePrice: 299, rating: 4.8, ratingCount: 276, badge: null, isDeal: false, stock: 999, sort: 3,
  },
  {
    id: "p-autocad", slug: "autodesk-autocad", categorySlug: "autodesk",
    name: "أوتوديسك أوتوكاد — سنة", latinName: "Autodesk AutoCAD",
    shortDesc: "الرسم الهندسي ثنائي وثلاثي الأبعاد بمعيار الصناعة.",
    longDesc: "اشتراك سنوي في برنامج AutoCAD الأصلي: مجموعات أدوات متخصصة للعمارة والميكانيكا والكهرباء، تطبيقات ويب وجوال مرفقة، ودعم صيغ DWG كامل لمشاريعك الهندسية.",
    features: ["مجموعات أدوات متخصصة (7 أدوات)", "تطبيق الويب والجوال مجانًا", "توافق كامل مع ملفات DWG", "أتمتة المهام المتكررة"],
    licenseType: "اشتراك رسمي", devices: "مستخدم واحد", duration: "12 شهرًا",
    price: 2999, comparePrice: 6999, rating: 4.9, ratingCount: 96, badge: null, isDeal: false, stock: 60, sort: 1,
  },
  {
    id: "p-revit", slug: "autodesk-revit", categorySlug: "autodesk",
    name: "أوتوديسك ريفيت — سنة", latinName: "Autodesk Revit",
    shortDesc: "نمذجة معلومات البناء BIM للمهندسين المعماريين والإنشائيين.",
    longDesc: "الأداة الأقوى لنمذجة معلومات البناء: تصميم معماري وإنشائي وكهروميكانيكي في نموذج واحد متكامل، مع جداول كميات تلقائية وتنسيق بين التخصصات. اشتراك سنوي رسمي.",
    features: ["نمذجة BIM متكاملة", "جداول كميات تلقائية", "تنسيق متعدد التخصصات", "تصدير لكل صيغ المشاريع"],
    licenseType: "اشتراك رسمي", devices: "مستخدم واحد", duration: "12 شهرًا",
    price: 3399, comparePrice: 8499, rating: 4.9, ratingCount: 71, badge: null, isDeal: false, stock: 60, sort: 2,
  },
];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function fallbackProducts(opts?: { category?: string; q?: string; deals?: boolean; sort?: string }) {
  let list = [...PRODUCTS];
  if (opts?.category) list = list.filter((p) => p.categorySlug === opts.category);
  if (opts?.deals) list = list.filter((p) => p.isDeal);
  if (opts?.q) {
    const q = opts.q.toLowerCase();
    list = list.filter(
      (p) => p.name.includes(q) || p.latinName.toLowerCase().includes(q) || p.shortDesc.includes(q)
    );
  }
  switch (opts?.sort) {
    case "price-asc": list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "discount": list.sort((a, b) => ((b.comparePrice ?? b.price) - b.price) - ((a.comparePrice ?? a.price) - a.price)); break;
    case "rating": list.sort((a, b) => b.rating - a.rating); break;
    default: list.sort((a, b) => a.sort - b.sort);
  }
  return list;
}

export function fallbackProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}
