"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useMenuContext } from "@/lib/providers/data-provider";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeCategory?: string;
  onCategorySelect?: (slug: string) => void;
  className?: string;
}

export function CategoryTabs({
  activeCategory,
  onCategorySelect,
  className,
}: CategoryTabsProps) {
  const { locale } = useLocaleContext();
  const { categories } = useMenuContext();
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
        "border-b border-white/8 bg-[#07090c]/65 backdrop-blur-2xl",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;

          return (
            <button
              key={cat.id}
              ref={isActive ? activeRef : undefined}
              onClick={() => onCategorySelect?.(cat.slug)}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
                isActive ? "text-[#0b0d10]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="category-tab-bg"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--pastel-mint)] to-[var(--pastel-peach)] shadow-[0_8px_24px_rgba(168,230,207,0.25)]"
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
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
