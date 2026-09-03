"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { menuItems } from "@/lib/data";
import { cn, formatPrice } from "@/lib/utils";

interface UpsellCardProps {
  excludeIds?: string[];
  onAdd?: (itemId: string) => void;
  className?: string;
}

export function UpsellCard({ excludeIds = [], onAdd, className }: UpsellCardProps) {
  const { locale } = useLocaleContext();

  const suggestions = useMemo(() => {
    const pool = menuItems.filter(
      (item) => !excludeIds.includes(item.id) && item.available
    );
    return pool.slice(0, 3);
  }, [excludeIds]);

  if (suggestions.length === 0) return null;

  return (
    <div className={cn("rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4", className)}>
      <h3 className="text-sm font-bold text-[#faf5e4] mb-3">
        {locale === "fa" ? "کنارش چی می‌چسبه؟" : "Complete your meal"}
      </h3>

      <div className="space-y-2">
        {suggestions.map((item) => {
          const name = locale === "fa" ? item.nameFa : item.nameEn;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl bg-[#0a0a0a] border border-[#1e1e1e] p-3"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#1a1a1a]">
                <img
                  src={item.image}
                  alt={name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-[#ccc] truncate">{name}</h4>
                <p className="text-xs text-amber-400 font-medium tabular-nums">
                  {formatPrice(item.basePrice, locale)}
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => onAdd?.(item.id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-400 hover:bg-amber-500/25 transition-colors"
              >
                <Plus size={14} />
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
