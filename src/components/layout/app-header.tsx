"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Globe } from "lucide-react";
import { useCartContext } from "@/lib/providers/cart-provider";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { useTable } from "@/lib/hooks";
import { cn, toPersianDigits } from "@/lib/utils";

interface AppHeaderProps {
  onSearchOpen?: () => void;
  onCartOpen?: () => void;
  className?: string;
}

export function AppHeader({ onSearchOpen, onCartOpen, className }: AppHeaderProps) {
  const { itemCount } = useCartContext();
  const { locale, setLocale } = useLocaleContext();
  const { table } = useTable();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  const handleLocaleToggle = () => {
    const target = locale === "fa" ? "en" : "fa";
    const restPath = pathname.replace(/^\/(fa|en)\b/, "");
    const search = table ? `?table=${table}` : "";
    router.push(`/${target}${restPath || "/menu"}${search}`);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0a0a0a]/85 backdrop-blur-xl border-b border-[#222]"
          : "bg-[#0a0a0a]/60 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-black tracking-tight text-[#faf5e4]">
            CHASHNI
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {table && (
            <span className="rounded-full bg-amber-500/15 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
              {locale === "fa" ? `میز ${toPersianDigits(table)}` : `Table ${table}`}
            </span>
          )}

          <button
            onClick={handleLocaleToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e1e1e] border border-[#333] text-[#999] hover:text-[#e8dcc8] hover:border-[#444] transition-colors"
          >
            <Globe size={18} />
          </button>

          <button
            onClick={onSearchOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e1e1e] border border-[#333] text-[#999] hover:text-[#e8dcc8] hover:border-[#444] transition-colors"
          >
            <Search size={18} />
          </button>

          <button
            onClick={onCartOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e1e1e] border border-[#333] text-[#999] hover:text-[#e8dcc8] hover:border-[#444] transition-colors"
          >
            <ShoppingCart size={18} />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black"
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
