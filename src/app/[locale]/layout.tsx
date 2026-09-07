"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { DataProvider } from "@/lib/providers/data-provider";
import { CartProvider } from "@/lib/providers/cart-provider";
import { LocaleProvider } from "@/lib/providers/locale-provider";
import { ToastProvider } from "@/lib/providers/toast-provider";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AppFooter } from "@/components/layout/app-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchOverlay } from "@/components/search/search-overlay";
import {
  DEFAULT_TENANT_SLUG,
  pathForLocale,
  tenantSlugFromPathname,
} from "@/lib/routes";
import type { Locale } from "@/lib/types";

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const slug = tenantSlugFromPathname(pathname) || DEFAULT_TENANT_SLUG;
  const rest = pathname.includes("/r/")
    ? pathname.replace(/^\/r\/[^/]+/, "") || "/"
    : pathname.replace(/^\/(fa|en)/, "") || "/";
  const isAdminRoute = rest === "/admin" || rest.startsWith("/admin/");

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
  }, [locale]);

  const handleLocaleChange = (target: Locale) => {
    router.push(pathForLocale(pathname, target, slug));
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
    <AuthProvider>
      <DataProvider>
        <LocaleProvider initialLocale={locale}>
          <CartProvider>
            <ToastProvider>
              {!isAdminRoute && (
                <AppHeader
                  onSearchOpen={() => setSearchOpen(true)}
                  onCartOpen={() => setCartOpen(true)}
                />
              )}

              <main className={isAdminRoute ? "flex-1" : "flex-1 pt-16 pb-20 md:pb-0"}>
                {children}
              </main>

              {!isAdminRoute && (
                <>
                  <MobileNav
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                      const restByTab: Record<string, string> = {
                        home: "/",
                        menu: "/menu",
                        favorites: "/favorites",
                        cart: "/cart",
                      };
                      const tabRest = restByTab[tab] || "/";
                      router.push(pathForLocale(tabRest, locale, slug));
                    }}
                  />
                  <AppFooter locale={locale} onLocaleChange={handleLocaleChange} />
                  <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
                  <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
                </>
              )}
            </ToastProvider>
          </CartProvider>
        </LocaleProvider>
      </DataProvider>
    </AuthProvider>
  );
}
