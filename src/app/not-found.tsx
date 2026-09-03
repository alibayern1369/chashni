import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-[#0a0a0a] text-[#faf5e4] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🍽️</div>
          <h1 className="text-4xl font-black mb-4 tracking-tight">۴۰۴</h1>
          <h2 className="text-xl font-bold mb-2">این میز پیدا نشد</h2>
          <p className="text-sm text-[#888] mb-8">
            The table you are looking for does not exist or has been reserved.
          </p>
          <Link
            href="/fa/menu"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 text-black px-6 py-3 font-bold text-sm hover:bg-amber-400 transition-colors"
          >
            بازگشت به منو
          </Link>
        </div>
      </body>
    </html>
  );
}
