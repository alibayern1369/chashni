"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CartProvider } from "@/lib/providers/cart-provider";
import { LocaleProvider } from "@/lib/providers/locale-provider";
import { ToastProvider } from "@/lib/providers/toast-provider";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AppFooter } from "@/components/layout/app-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchOverlay } from "@/components/search/search-overlay";
import type { Locale } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a0a]">
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
                activeTab="home"
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

              <AppFooter locale={locale} />

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
      </body>
    </html>
  );
}
