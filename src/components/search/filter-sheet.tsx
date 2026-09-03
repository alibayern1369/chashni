"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Leaf, Flame, Award, ChefHat, Sparkles, Trash2 } from "lucide-react";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { FilterOptions } from "@/lib/types";

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFilterChange: <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

export function FilterSheet({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClear,
  hasActiveFilters,
  className,
}: FilterSheetProps) {
  const { locale } = useLocaleContext();

  const chips: {
    key: "vegetarian" | "spicy" | "bestseller" | "chefPick" | "isNew";
    icon: typeof Leaf;
    labelFa: string;
    labelEn: string;
  }[] = [
    { key: "vegetarian", icon: Leaf, labelFa: "گیاهی", labelEn: "Vegetarian" },
    { key: "spicy", icon: Flame, labelFa: "تند", labelEn: "Spicy" },
    { key: "bestseller", icon: Award, labelFa: "پرفروش", labelEn: "Bestseller" },
    { key: "chefPick", icon: ChefHat, labelFa: "سرآشپز", labelEn: "Chef's Pick" },
    { key: "isNew", icon: Sparkles, labelFa: "جدید", labelEn: "New" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-[70] rounded-t-3xl bg-[#0a0a0a] border-t border-[#222] p-5 pb-8",
              className
            )}
          >
            <div className="mx-auto max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#faf5e4]">
                  {locale === "fa" ? "فیلترها" : "Filters"}
                </h3>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e1e1e] text-[#888] hover:text-[#ccc]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {chips.map(({ key, icon: Icon, labelFa, labelEn }) => {
                  const isActive = filters[key] === true;
                  return (
                    <button
                      key={key}
                      onClick={() => onFilterChange(key, !isActive)}
                      className={cn(
                        "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all border",
                        isActive
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                          : "bg-[#141414] border-[#222] text-[#888] hover:border-[#333]"
                      )}
                    >
                      <Icon size={16} />
                      {locale === "fa" ? labelFa : labelEn}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex gap-3">
                <Button
                  variant="ghost"
                  onClick={onClear}
                  disabled={!hasActiveFilters}
                  icon={<Trash2 size={14} />}
                  className="flex-1"
                >
                  {locale === "fa" ? "پاک کردن" : "Clear All"}
                </Button>
                <Button variant="primary" onClick={onClose} className="flex-1">
                  {locale === "fa" ? "اعمال" : "Apply"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
