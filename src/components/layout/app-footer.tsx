"use client";

import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMenuContext } from "@/lib/providers/data-provider";
import { NamakdanLogo } from "@/components/brand/namakdan-logo";
import { SocialIconLinks } from "@/components/brand/social-icons";
import { cn } from "@/lib/utils";
import {
  DEFAULT_TENANT_SLUG,
  restaurantPath,
  tenantSlugFromPathname,
} from "@/lib/routes";
import type { Locale } from "@/lib/types";

interface AppFooterProps {
  locale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
  className?: string;
}

export function AppFooter({ locale = "fa", onLocaleChange, className }: AppFooterProps) {
  const { restaurant, social } = useMenuContext();
  const pathname = usePathname();
  const slug = tenantSlugFromPathname(pathname) || DEFAULT_TENANT_SLUG;

  const navLinks = [
    { href: restaurantPath("/menu", slug), labelFa: "منو", labelEn: "Menu" },
    { href: restaurantPath("/build-burger", slug), labelFa: "برگر بساز", labelEn: "Build Burger" },
    { href: restaurantPath("/favorites", slug), labelFa: "علاقه‌مندی‌ها", labelEn: "Favorites" },
  ];

  return (
    <footer className={cn("bg-[#0a0a0a] border-t border-[#1e1e1e]", className)}>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <NamakdanLogo
              href={restaurantPath("", slug)}
              locale={locale}
              size={40}
              className="mb-3"
            />
            <p className="text-sm text-[#888] mt-3">
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

            <div className="mt-4">
              <p className="text-xs text-[#666] mb-2">
                {locale === "fa" ? "شبکه‌های اجتماعی" : "Social"}
              </p>
              <SocialIconLinks links={social} />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1e1e1e] pt-6">
          <p className="text-xs text-[#555]">
            &copy; {new Date().getFullYear()}{" "}
            {locale === "fa" ? "نمکدان" : "Namakdan"}.{" "}
            {locale === "fa" ? "تمامی حقوق محفوظ است" : "All rights reserved"}
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
