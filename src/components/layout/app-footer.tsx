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
    { href: restaurantPath("/favorites", slug), labelFa: "علاقه‌مندی‌ها", labelEn: "Favorites" },
    { href: restaurantPath("", slug), labelFa: "خانه", labelEn: "Home" },
  ];

  return (
    <footer className={cn("mt-8 border-t border-white/8", className)}>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <NamakdanLogo
              href={restaurantPath("", slug)}
              locale={locale}
              size={44}
              className="mb-3"
            />
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              {locale === "fa" ? restaurant.sloganFa : restaurant.sloganEn}
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
              {locale === "fa" ? "دسترسی سریع" : "Quick Links"}
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--pastel-mint)]"
                  >
                    {locale === "fa" ? link.labelFa : link.labelEn}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
              {locale === "fa" ? "ساعات کاری" : "Opening Hours"}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              {restaurant.hours.open} – {restaurant.hours.close}
            </p>

            <div className="mt-4">
              <p className="mb-2 text-xs text-[var(--color-text-muted)]">
                {locale === "fa" ? "شبکه‌های اجتماعی" : "Social"}
              </p>
              <SocialIconLinks links={social} />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-6 sm:flex-row">
          <p className="text-xs text-[#5c6575]">
            &copy; {new Date().getFullYear()}{" "}
            {locale === "fa" ? "نمکدان" : "Namakdan"}.{" "}
            {locale === "fa" ? "تمامی حقوق محفوظ است" : "All rights reserved"}
          </p>

          {onLocaleChange && (
            <button
              onClick={() => onLocaleChange(locale === "fa" ? "en" : "fa")}
              className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--pastel-mint)]"
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
