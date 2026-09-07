"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { BurgerBuilder } from "@/components/burger-builder/burger-builder";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import {
  DEFAULT_TENANT_SLUG,
  pathForLocale,
  tenantSlugFromPathname,
} from "@/lib/routes";

export default function BuildBurgerPage() {
  const { locale } = useLocaleContext();
  const isRtl = locale === "fa";
  const router = useRouter();
  const pathname = usePathname();
  const slug = tenantSlugFromPathname(pathname) || DEFAULT_TENANT_SLUG;

  return (
    <div className="relative min-h-screen px-4 py-6">
      <div className="relative mx-auto mb-6 max-w-2xl">
        <button
          type="button"
          onClick={() => router.push(pathForLocale("/menu", locale, slug))}
          className="glass mb-5 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-all hover:border-white/25"
        >
          <ArrowRight size={16} className={isRtl ? "" : "rotate-180"} />
          <UtensilsCrossed size={15} className="text-[var(--pastel-mint)]" />
          {isRtl ? "بازگشت به منو" : "Back to menu"}
        </button>

        <div className="text-center">
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
      </div>

      <BurgerBuilder />
    </div>
  );
}
