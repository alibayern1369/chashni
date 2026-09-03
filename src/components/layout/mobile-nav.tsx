"use client";

import { Home, UtensilsCrossed, Beef, Heart, ShoppingCart } from "lucide-react";
import { useCartContext } from "@/lib/providers/cart-provider";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MobileNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

const tabs = [
  { id: "home", icon: Home, labelFa: "خانه", labelEn: "Home" },
  { id: "menu", icon: UtensilsCrossed, labelFa: "منو", labelEn: "Menu" },
  { id: "build", icon: Beef, labelFa: "برگر", labelEn: "Burger" },
  { id: "favorites", icon: Heart, labelFa: "علاقه‌مندی", labelEn: "Favorites" },
  { id: "cart", icon: ShoppingCart, labelFa: "سبد", labelEn: "Cart" },
];

export function MobileNav({ activeTab = "home", onTabChange, className }: MobileNavProps) {
  const { itemCount } = useCartContext();
  const { locale } = useLocaleContext();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-[#222]",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === "cart" && itemCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-3"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-amber-400"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}

              <div className="relative">
                <Icon
                  size={20}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-amber-400" : "text-[#666]"
                  )}
                />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-black">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-amber-400" : "text-[#666]"
                )}
              >
                {locale === "fa" ? tab.labelFa : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
