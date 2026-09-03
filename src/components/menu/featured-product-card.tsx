"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Flame, Leaf } from "lucide-react";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Price } from "@/components/ui/price";
import type { MenuItem } from "@/lib/types";

interface FeaturedProductCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  onOpenDetail?: (item: MenuItem) => void;
  className?: string;
}

export function FeaturedProductCard({ item, onAddToCart, onOpenDetail, className }: FeaturedProductCardProps) {
  const { locale } = useLocaleContext();
  const [imgError, setImgError] = useState(false);

  const name = locale === "fa" ? item.nameFa : item.nameEn;
  const desc = locale === "fa" ? item.descFa : item.descEn;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpenDetail?.(item)}
      className={cn(
        "group relative flex flex-col sm:flex-row rounded-3xl bg-[#141414] border border-[#1e1e1e] overflow-hidden cursor-pointer",
        "hover:border-[#333] transition-all duration-200",
        className
      )}
    >
      <div className="relative aspect-[4/3] sm:aspect-auto sm:w-2/5 overflow-hidden bg-[#1a1a1a]">
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            🍔
          </div>
        ) : (
          <img
            src={item.image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}

        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5">
          {item.isBestseller && <Badge variant="bestseller">{locale === "fa" ? "پرفروش" : "Bestseller"}</Badge>}
          {item.isChefPick && <Badge variant="chefPick">{locale === "fa" ? "ویژه سرآشپز" : "Chef's Pick"}</Badge>}
          {item.isNew && <Badge variant="new">{locale === "fa" ? "جدید" : "New"}</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-bold text-[#faf5e4]">{name}</h3>
          <p className="mt-1 text-sm text-[#888] leading-relaxed line-clamp-3">{desc}</p>
        </div>

        <Rating rating={item.rating} reviewCount={item.reviewCount} size="md" />

        <div className="flex items-center gap-3 text-xs text-[#666]">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {item.preparationTime} {locale === "fa" ? "دقیقه" : "min"}
          </span>
          <span>{item.calories} {locale === "fa" ? "کالری" : "cal"}</span>
          {item.spicyLevel > 0 && (
            <span className="flex items-center gap-0.5">
              <Flame size={12} className="text-red-400" />
              {item.spicyLevel}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[#1e1e1e] pt-3">
          <Price amount={item.basePrice} locale={locale} size="lg" />

          {item.available && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onAddToCart?.(item);
              }}
              className="flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
            >
              <Plus size={16} />
              {locale === "fa" ? "افزودن" : "Add"}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
