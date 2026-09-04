import Link from "next/link";
import { restaurantPath, sitePath, superPath } from "@/lib/routes";

const SECTIONS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "۱) سوپر ادمین پلتفرم",
    links: [
      { href: superPath("/login"), label: "ورود سوپر" },
      { href: superPath(), label: "داشبورد سوپر" },
      { href: superPath("/tenants"), label: "رستوران‌ها + ماژول‌ها" },
      { href: superPath("/users"), label: "کاربران و رمزها" },
    ],
  },
  {
    title: "۲) رستوران چاشنی — مشتری",
    links: [
      { href: restaurantPath(), label: "هوم رستوران" },
      { href: restaurantPath("/menu"), label: "منو" },
      { href: restaurantPath("/menu") + "?table=07", label: "منو با میز ۰۷" },
      { href: restaurantPath("/build-burger"), label: "ساخت برگر" },
      { href: restaurantPath("/cart"), label: "سبد" },
      { href: restaurantPath("/checkout"), label: "تسویه" },
      { href: restaurantPath("/login"), label: "ورود مشتری/ادمین رستوران" },
    ],
  },
  {
    title: "۳) رستوران چاشنی — ادمین",
    links: [
      { href: restaurantPath("/admin"), label: "سفارش‌ها" },
      { href: restaurantPath("/admin/menu"), label: "مدیریت منو" },
      { href: restaurantPath("/admin/kitchen"), label: "آشپزخانه" },
      { href: restaurantPath("/admin/tables"), label: "میز و QR" },
      { href: restaurantPath("/admin/pages"), label: "لندینگ CMS رستوران" },
      { href: restaurantPath("/admin/settings"), label: "تنظیمات" },
    ],
  },
  {
    title: "۴) لندینگ پلتفرم + ادمین لندینگ",
    links: [
      { href: sitePath(), label: "لندینگ محصول" },
      { href: sitePath("/links"), label: "نقشه لینک‌ها" },
      { href: sitePath("/admin"), label: "ادمین لندینگ پلتفرم" },
    ],
  },
  {
    title: "۵) دمو",
    links: [
      { href: "/demo/admin", label: "داشبورد دمو" },
      { href: "/demo/admin/orders", label: "دمو سفارش‌ها" },
      { href: "/demo/admin/menu", label: "دمو منو" },
      { href: "/demo/admin/qr", label: "دمو QR" },
      { href: "/demo/design-system", label: "دیزاین سیستم" },
    ],
  },
];

export default function SiteLinksPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-[#faf5e4]">
      <div className="mx-auto max-w-3xl">
        <Link href={sitePath()} className="text-sm text-amber-400 hover:underline">
          ← بازگشت به لندینگ
        </Link>
        <h1 className="mt-4 text-3xl font-black">نقشه لینک‌ها — جدا و واضح</h1>
        <p className="mt-2 text-sm text-[#888]" dir="ltr">
          /site · /super · /r/chashni · /demo
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-lg font-bold text-amber-400">{section.title}</h2>
              <ul className="space-y-2 rounded-2xl border border-[#1e1e1e] bg-[#121212] p-4">
                {section.links.map((link) => (
                  <li
                    key={link.href}
                    className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between"
                  >
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
