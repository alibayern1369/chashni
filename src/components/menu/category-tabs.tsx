"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { categories } from "@/lib/data";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeCategory?: string;
  onCategorySelect?: (slug: string) => void;
  className?: string;
}

export function CategoryTabs({ activeCategory, onCategorySelect, className }: CategoryTabsProps) {
  const { locale } = useLocaleContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [activeCategory]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "sticky top-16 z-40 overflow-x-auto scrollbar-none",
        "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1e1e1e]",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl gap-1 px-4 py-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;

          return (
            <button
              key={cat.id}
              ref={isActive ? activeRef : undefined}
              onClick={() => onCategorySelect?.(cat.slug)}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "text-amber-400"
                  : "text-[#888] hover:text-[#ccc]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="category-tab-bg"
                  className="absolute inset-0 rounded-full bg-amber-500/10 border border-amber-500/20"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">{cat.icon}</span>
              <span className="relative z-10">
                {locale === "fa" ? cat.nameFa : cat.nameEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
