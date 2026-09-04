import Link from "next/link";
import { restaurantPath, sitePath, superPath } from "@/lib/routes";

export default function PlatformLandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#faf5e4]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_55%)]" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-xl font-black tracking-tight">
          CHASHNI <span className="text-amber-400">Platform</span>
        </span>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link href={sitePath("/links")} className="text-[#888] hover:text-amber-400">
            لینک‌ها
          </Link>
          <Link href="/demo/admin" className="text-[#888] hover:text-amber-400">
            دمو
          </Link>
          <Link href={sitePath("/admin")} className="text-[#888] hover:text-amber-400">
            ادمین لندینگ
          </Link>
          <Link
            href={superPath("/login")}
            className="rounded-xl bg-amber-500 px-3 py-1.5 font-bold text-black hover:bg-amber-400"
          >
            سوپر ادمین
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-16 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-amber-400/80">
          Multi-tenant QR restaurant
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
          منوی دیجیتال رستوران
          <span className="block text-amber-400">با آدرس‌های جدا و واضح</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-[#999] sm:text-lg">
          سوپر ادمین، رستوران، لندینگ و دمو هر کدام مسیر خودشان را دارند.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={restaurantPath("/menu")}
            className="rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400"
          >
            منوی رستوران چاشنی
          </Link>
          <Link
            href={restaurantPath("/admin")}
            className="rounded-2xl border border-[#333] bg-[#141414] px-6 py-3 text-sm font-bold text-[#ccc] hover:border-amber-500/40"
          >
            ادمین رستوران
          </Link>
          <Link
            href={superPath()}
            className="rounded-2xl border border-[#333] bg-[#141414] px-6 py-3 text-sm font-bold text-[#ccc] hover:border-amber-500/40"
          >
            سوپر ادمین
          </Link>
          <Link
            href="/demo/admin"
            className="rounded-2xl border border-[#333] bg-[#141414] px-6 py-3 text-sm font-bold text-[#ccc] hover:border-amber-500/40"
          >
            دمو
          </Link>
        </div>

        <section className="mt-20 grid gap-4 text-right sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "/site", d: "لندینگ محصول و نقشه لینک‌ها" },
            { t: "/super", d: "سوپر ادمین پلتفرم" },
            { t: "/r/chashni", d: "منو و ادمین رستوران" },
            { t: "/demo", d: "دمو پورتفولیو بدون auth" },
          ].map((card) => (
            <div
              key={card.t}
              className="rounded-2xl border border-[#1e1e1e] bg-[#121212]/80 p-5"
            >
              <h2 className="font-mono text-sm font-bold text-amber-400" dir="ltr">
                {card.t}
              </h2>
              <p className="mt-2 text-sm text-[#888]">{card.d}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
