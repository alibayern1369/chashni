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
      <div className="flex items-center gap-2 mb-4">
        {categoryIcon && <span className="text-xl">{categoryIcon}</span>}
        <h2 className="text-lg font-bold text-[#faf5e4]">
          {locale === "fa" ? categoryNameFa : categoryNameEn}
        </h2>
        <span className="text-xs text-[#555] ml-auto">{items.length} items</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
