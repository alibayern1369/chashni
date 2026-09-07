"use client";

import { Home, UtensilsCrossed, Heart, ShoppingCart } from "lucide-react";
import { useCartContext } from "@/lib/providers/cart-provider";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MobileNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

/** Build-burger is landing-only — not in menu chrome */
const tabs = [
  { id: "home", icon: Home, labelFa: "خانه", labelEn: "Home" },
  { id: "menu", icon: UtensilsCrossed, labelFa: "منو", labelEn: "Menu" },
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
        "border-t border-white/10 bg-[#07090c]/75 backdrop-blur-2xl",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === "cart" && itemCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-gradient-to-r from-[var(--pastel-mint)] to-[var(--pastel-peach)]"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}

              <div className="relative">
                <Icon
                  size={20}
                  className={cn(
                    "transition-colors duration-300",
                    isActive ? "text-[var(--pastel-mint)]" : "text-[#667084]",
                  )}
                />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--pastel-peach)] text-[8px] font-bold text-[#0b0d10]">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-300",
                  isActive ? "text-[var(--pastel-mint)]" : "text-[#667084]",
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
