"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Globe, User } from "lucide-react";
import { useCartContext } from "@/lib/providers/cart-provider";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { useAuth } from "@/lib/auth/auth-provider";
import { useTable } from "@/lib/hooks";
import { cn, toPersianDigits } from "@/lib/utils";
import { NamakdanLogo } from "@/components/brand/namakdan-logo";
import {
  DEFAULT_TENANT_SLUG,
  pathForLocale,
  restaurantPath,
  tenantSlugFromPathname,
} from "@/lib/routes";

interface AppHeaderProps {
  onSearchOpen?: () => void;
  onCartOpen?: () => void;
  className?: string;
}

export function AppHeader({ onSearchOpen, onCartOpen, className }: AppHeaderProps) {
  const { itemCount } = useCartContext();
  const { locale, setLocale } = useLocaleContext();
  const { user } = useAuth();
  const { table } = useTable();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const slug = tenantSlugFromPathname(pathname) || DEFAULT_TENANT_SLUG;

  const handleLocaleToggle = () => {
    const target = locale === "fa" ? "en" : "fa";
    setLocale(target);
    const search = table ? `?table=${table}` : "";
    router.push(`${pathForLocale(pathname, target, slug)}${search}`);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-[#07090c]/75 backdrop-blur-2xl"
          : "bg-transparent",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <NamakdanLogo href={restaurantPath("", slug)} locale={locale} size={38} />

        <div className="flex items-center gap-2">
          {table && (
            <span className="glass-pastel-peach rounded-full px-3 py-1 text-xs font-bold text-[var(--pastel-peach)]">
              {locale === "fa" ? `میز ${toPersianDigits(table)}` : `Table ${table}`}
            </span>
          )}

          <button
            onClick={() =>
              router.push(pathForLocale(user ? "/account" : "/login", locale, slug))
            }
            className="glass flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            aria-label={locale === "fa" ? "حساب کاربری" : "Account"}
          >
            <User size={18} />
          </button>

          <button
            onClick={handleLocaleToggle}
            className="glass flex h-10 items-center justify-center gap-1.5 rounded-2xl px-3 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            aria-label={locale === "fa" ? "Switch to English" : "تغییر به فارسی"}
          >
            <Globe size={15} />
            <span className="text-xs font-semibold">
              {locale === "fa" ? "English" : "فارسی"}
            </span>
          </button>

          <button
            onClick={onSearchOpen}
            className="glass flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            aria-label={locale === "fa" ? "جستجو" : "Search"}
          >
            <Search size={18} />
          </button>

          <button
            onClick={onCartOpen}
            className="glass relative flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            aria-label={locale === "fa" ? "سبد خرید" : "Cart"}
          >
            <ShoppingCart size={18} />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--pastel-mint)] text-[10px] font-bold text-[#0b0d10]"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
