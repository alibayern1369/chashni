"use client";

import { useLocaleContext } from "@/lib/providers/locale-provider";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import type { MenuItem } from "@/lib/types";

interface MenuSectionProps {
  categoryId: string;
  categoryNameFa: string;
  categoryNameEn: string;
  categoryIcon?: string;
  items: MenuItem[];
  onAddToCart?: (item: MenuItem) => void;
  onOpenDetail?: (item: MenuItem) => void;
  className?: string;
}

export function MenuSection({
  categoryId,
  categoryNameFa,
  categoryNameEn,
  categoryIcon,
  items,
  onAddToCart,
  onOpenDetail,
  className,
}: MenuSectionProps) {
  const { locale } = useLocaleContext();

  return (
    <section id={`category-${categoryId}`} className={cn("scroll-mt-32", className)}>
      <div className="mb-5 flex items-center gap-3">
        {categoryIcon && (
          <span className="glass flex h-10 w-10 items-center justify-center rounded-2xl text-lg">
            {categoryIcon}
          </span>
        )}
        <div>
          <h2 className="text-lg font-black tracking-tight text-[var(--color-text)]">
            {locale === "fa" ? categoryNameFa : categoryNameEn}
          </h2>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            {items.length} {locale === "fa" ? "غذا" : "dishes"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </section>
  );
}
