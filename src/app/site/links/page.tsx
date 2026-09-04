import Link from "next/link";

const SECTIONS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "۱) سوپر ادمین — رستوران‌ها و کاربران",
    links: [
      { href: "/fa/admin/super", label: "داشبورد سوپر" },
      { href: "/fa/admin/super/tenants", label: "تعریف رستوران‌ها + ماژول‌ها" },
      { href: "/fa/admin/super/users", label: "کاربران و نقش‌ها" },
    ],
  },
  {
    title: "۲) منوی مشتری",
    links: [
      { href: "/fa/menu", label: "منو (فارسی)" },
      { href: "/fa/menu?table=07", label: "منو با میز ۰۷" },
      { href: "/en/menu", label: "Menu (English)" },
      { href: "/fa/build-burger", label: "ساخت برگر" },
      { href: "/fa/cart", label: "سبد خرید" },
      { href: "/fa/checkout", label: "تسویه حساب" },
    ],
  },
  {
    title: "۳) ادمین هر رستوران",
    links: [
      { href: "/fa/login", label: "ورود" },
      { href: "/fa/admin", label: "سفارش‌ها" },
      { href: "/fa/admin/menu", label: "مدیریت منو" },
      { href: "/fa/admin/kitchen", label: "آشپزخانه" },
      { href: "/fa/admin/tables", label: "میزها و QR" },
      { href: "/fa/admin/promotions", label: "تخفیف‌ها" },
      { href: "/fa/admin/media", label: "تصاویر" },
      { href: "/fa/admin/settings", label: "تنظیمات (+ زرین‌پال)" },
      { href: "/fa/admin/reservations", label: "رزرو میز" },
    ],
  },
  {
    title: "۴) لندینگ + ادمین لندینگ",
    links: [
      { href: "/site", label: "لندینگ پلتفرم محصول" },
      { href: "/fa", label: "لندینگ رستوران (CMS یا برند)" },
      { href: "/fa/admin/pages", label: "ادمین صفحات لندینگ" },
      { href: "/site/links", label: "همین نقشه لینک‌ها" },
      { href: "/fa/reserve", label: "رزرو میز (مشتری)" },
      { href: "/fa/p/about", label: "صفحه CMS نمونه (slug)" },
    ],
  },
  {
    title: "۵) دمو",
    links: [
      { href: "/demo/admin", label: "داشبورد دمو" },
      { href: "/demo/admin/orders", label: "دمو سفارش‌ها" },
      { href: "/demo/admin/menu", label: "دمو منو" },
      { href: "/demo/admin/qr", label: "دمو QR" },
      { href: "/demo/admin/settings", label: "دمو تنظیمات" },
      { href: "/demo/design-system", label: "دیزاین سیستم" },
      { href: "/fa/qr-demo", label: "دمو QR میزها" },
    ],
  },
];

export default function SiteLinksPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-[#faf5e4]">
      <div className="mx-auto max-w-3xl">
        <Link href="/site" className="text-sm text-amber-400 hover:underline">
          ← بازگشت به لندینگ
        </Link>
        <h1 className="mt-4 text-3xl font-black">نقشه لینک‌ها — CHASHNI</h1>
        <p className="mt-2 text-sm text-[#888]">
          هر بخش جدا؛ برای پورتفولیو، سوپرادمین، منو، ادمین رستوران، لندینگ و دمو.
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-lg font-bold text-amber-400">{section.title}</h2>
              <ul className="space-y-2 rounded-2xl border border-[#1e1e1e] bg-[#121212] p-4">
                {section.links.map((link) => (
                  <li key={link.href} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-[#ccc]">{link.label}</span>
                    <Link
                      href={link.href}
                      className="font-mono text-xs text-amber-400/90 hover:underline"
                      dir="ltr"
                    >
                      {link.href}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
