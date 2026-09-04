"use client";

import { Globe } from "lucide-react";
import { useMenuContext } from "@/lib/providers/data-provider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface AppFooterProps {
  locale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
  className?: string;
}

const navLinks = [
  { href: "/#menu", labelFa: "منو", labelEn: "Menu" },
  { href: "/#build-burger", labelFa: "برگر بساز", labelEn: "Build Burger" },
  { href: "/#favorites", labelFa: "علاقه‌مندی‌ها", labelEn: "Favorites" },
];

export function AppFooter({ locale = "fa", onLocaleChange, className }: AppFooterProps) {
  const { restaurant } = useMenuContext();
  return (
    <footer className={cn("bg-[#0a0a0a] border-t border-[#1e1e1e]", className)}>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h2 className="text-xl font-black text-[#faf5e4] tracking-tight mb-2">
              CHASHNI
            </h2>
            <p className="text-sm text-[#888]">
              {locale === "fa" ? restaurant.sloganFa : restaurant.sloganEn}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#faf5e4] mb-3">
              {locale === "fa" ? "دسترسی سریع" : "Quick Links"}
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[#888] hover:text-amber-400 transition-colors"
                  >
                    {locale === "fa" ? link.labelFa : link.labelEn}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#faf5e4] mb-3">
              {locale === "fa" ? "ساعات کاری" : "Opening Hours"}
            </h3>
            <p className="text-sm text-[#888]">
              {restaurant.hours.open} – {restaurant.hours.close}
            </p>

            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e1e1e] border border-[#333] text-[#888] hover:text-amber-400 hover:border-amber-500/30 transition-colors text-xs font-bold"
              >
                IG
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e1e1e] border border-[#333] text-[#888] hover:text-amber-400 hover:border-amber-500/30 transition-colors text-xs font-bold"
              >
                TG
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1e1e1e] pt-6">
          <p className="text-xs text-[#555]">
            &copy; {new Date().getFullYear()} CHASHNI. {locale === "fa" ? "تمامی حقوق محفوظ است" : "All rights reserved"}
          </p>

          {onLocaleChange && (
            <button
              onClick={() => onLocaleChange(locale === "fa" ? "en" : "fa")}
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-amber-400 transition-colors"
            >
              <Globe size={14} />
              {locale === "fa" ? "English" : "فارسی"}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
