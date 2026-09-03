"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { CartProvider } from "@/lib/providers/cart-provider";
import { LocaleProvider } from "@/lib/providers/locale-provider";
import { ToastProvider } from "@/lib/providers/toast-provider";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AppFooter } from "@/components/layout/app-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchOverlay } from "@/components/search/search-overlay";
import type { Locale } from "@/lib/types";

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
  }, [locale]);

  const handleLocaleChange = (target: Locale) => {
    const restPath = pathname.replace(/^\/(fa|en)\b/, "");
    router.push(`/${target}${restPath || "/menu"}`);
  };

  const activeTab = pathname.includes("/cart")
    ? "cart"
    : pathname.includes("/build-burger")
    ? "build"
    : pathname.includes("/favorites")
    ? "favorites"
    : pathname.includes("/menu")
    ? "menu"
    : "home";

  return (
    <LocaleProvider initialLocale={locale}>
      <CartProvider>
        <ToastProvider>
          <AppHeader
            onSearchOpen={() => setSearchOpen(true)}
            onCartOpen={() => setCartOpen(true)}
          />

          <main className="flex-1 pt-16 pb-20 md:pb-0">
            {children}
          </main>

          <MobileNav
            activeTab={activeTab}
            onTabChange={(tab) => {
              const routes: Record<string, string> = {
                home: `/${locale}`,
                menu: `/${locale}/menu`,
                build: `/${locale}/build-burger`,
                favorites: `/${locale}/favorites`,
                cart: `/${locale}/cart`,
              };
              router.push(routes[tab] || `/${locale}`);
            }}
          />

          <AppFooter
            locale={locale}
            onLocaleChange={handleLocaleChange}
          />

          <CartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            onCheckout={() => {
              setCartOpen(false);
              router.push(`/${locale}/checkout`);
            }}
          />

          <SearchOverlay
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
          />
        </ToastProvider>
      </CartProvider>
    </LocaleProvider>
  );
}
