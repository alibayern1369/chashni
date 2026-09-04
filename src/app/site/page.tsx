import Link from "next/link";

export default function PlatformLandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#faf5e4]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_55%)] pointer-events-none" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-xl font-black tracking-tight">
          CHASHNI <span className="text-amber-400">Platform</span>
        </span>
        <nav className="flex gap-3 text-sm">
          <Link href="/site/links" className="text-[#888] hover:text-amber-400">
            Links
          </Link>
          <Link href="/demo/admin" className="text-[#888] hover:text-amber-400">
            Demo
          </Link>
          <Link
            href="/fa/login"
            className="rounded-xl bg-amber-500 px-3 py-1.5 font-bold text-black hover:bg-amber-400"
          >
            Login
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-16 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-amber-400/80">
          Multi-tenant QR restaurant
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
          منوی دیجیتال رستوران
          <span className="block text-amber-400">با ماژول‌های اختیاری</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-[#999] sm:text-lg">
          هستهٔ منو و سفارش QR، به‌همراه پرداخت زرین‌پال، CMS لندینگ، میزها، آشپزخانه،
          تخفیف، ارسال و باشگاه مشتریان — همه قابل روشن/خاموش از سوپرادمین.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/fa/menu"
            className="rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400"
          >
            مشاهده منو
          </Link>
          <Link
            href="/demo/admin"
            className="rounded-2xl border border-[#333] bg-[#141414] px-6 py-3 text-sm font-bold text-[#ccc] hover:border-amber-500/40"
          >
            دمو ادمین
          </Link>
          <Link
            href="/fa/admin/super"
            className="rounded-2xl border border-[#333] bg-[#141414] px-6 py-3 text-sm font-bold text-[#ccc] hover:border-amber-500/40"
          >
            سوپر ادمین
          </Link>
        </div>

        <section className="mt-20 grid gap-4 text-left sm:grid-cols-3">
          {[
            {
              t: "هسته منو",
              d: "دوزبانه، سفارشی‌سازی، Build Burger، سبد و چک‌اوت.",
            },
            {
              t: "ماژولار",
              d: "پرداخت، CMS، ارسال، وفاداری و رزرو فقط وقتی فعال باشند.",
            },
            {
              t: "عملیاتی",
              d: "آشپزخانه، میز QR، تخفیف، مدیا و پنل سوپر برای چند رستوران.",
            },
          ].map((card) => (
            <div
              key={card.t}
              className="rounded-2xl border border-[#1e1e1e] bg-[#121212]/80 p-5"
            >
              <h2 className="text-lg font-bold text-amber-400">{card.t}</h2>
              <p className="mt-2 text-sm text-[#888]">{card.d}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
