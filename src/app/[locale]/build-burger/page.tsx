"use client";

import { BurgerBuilder } from "@/components/burger-builder/burger-builder";
import { useLocaleContext } from "@/lib/providers/locale-provider";

export default function BuildBurgerPage() {
  const { locale } = useLocaleContext();
  const isRtl = locale === "fa";

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 right-[-10%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(168,230,207,0.2),transparent_70%)]" />
        <div className="absolute bottom-20 left-[-8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,211,182,0.16),transparent_70%)]" />
      </div>

      <div className="relative mx-auto mb-8 max-w-2xl text-center">
        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[var(--pastel-mint)] uppercase">
          Namakdan Studio
        </p>
        <h1 className="mb-2 text-3xl font-black tracking-tight text-[var(--color-text)] md:text-4xl">
          {isRtl ? "برگر خودتو بساز" : "Build Your Burger"}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {isRtl
            ? "لایه به لایه انتخاب کن و ببین برگر زنده شکل می‌گیره"
            : "Pick layer by layer and watch your burger come alive"}
        </p>
      </div>

      <BurgerBuilder />
    </div>
  );
}
