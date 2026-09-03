"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartContext } from "@/lib/providers/cart-provider";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { cn, formatPrice } from "@/lib/utils";

interface FloatingCartBarProps {
  onClick?: () => void;
  className?: string;
}

export function FloatingCartBar({ onClick, className }: FloatingCartBarProps) {
  const { itemCount, total } = useCartContext();
  const { locale } = useLocaleContext();

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={cn(
            "fixed bottom-20 md:bottom-4 inset-x-0 z-40 px-4 md:hidden",
            className
          )}
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-l from-amber-500 to-orange-600 px-5 py-3.5 shadow-2xl shadow-amber-500/30"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart size={20} className="text-black" />
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-amber-400">
                  {itemCount}
                </span>
              </div>
              <span className="text-sm font-bold text-black">
                {locale === "fa" ? "مشاهده سبد" : "View Cart"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm font-bold text-black">
              <span>{formatPrice(total, locale)}</span>
              {locale === "fa" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
