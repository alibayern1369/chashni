"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Leaf, Flame } from "lucide-react";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { useFavorites } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Price } from "@/components/ui/price";
import type { MenuItem } from "@/lib/types";

interface ProductCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  onOpenDetail?: (item: MenuItem) => void;
  className?: string;
}

export function ProductCard({ item, onAddToCart, onOpenDetail, className }: ProductCardProps) {
  const { locale } = useLocaleContext();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imgError, setImgError] = useState(false);

  const name = locale === "fa" ? item.nameFa : item.nameEn;
  const desc = locale === "fa" ? item.descFa : item.descEn;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpenDetail?.(item)}
      className={cn(
        "group relative flex flex-col rounded-2xl bg-[#141414] border border-[#1e1e1e] overflow-hidden cursor-pointer",
        "hover:border-[#333] transition-all duration-200",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            🍔
          </div>
        ) : (
          <img
            src={item.image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}

        <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1">
          {item.isBestseller && <Badge variant="bestseller">{locale === "fa" ? "پرفروش" : "Bestseller"}</Badge>}
          {item.isNew && <Badge variant="new">{locale === "fa" ? "جدید" : "New"}</Badge>}
          {item.isChefPick && <Badge variant="chefPick">{locale === "fa" ? "ویژه سرآشپز" : "Chef's Pick"}</Badge>}
          {item.isVegetarian && <Badge variant="vegetarian">{locale === "fa" ? "گیاهی" : "Veggie"}</Badge>}
        </div>

        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <span className="text-sm font-semibold text-white">
              {locale === "fa" ? "موجود نیست" : "Unavailable"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="text-sm font-semibold text-[#faf5e4] line-clamp-1">{name}</h3>
        <p className="text-xs text-[#888] line-clamp-2 leading-relaxed">{desc}</p>

        <div className="mt-auto flex items-center gap-2">
          <Rating rating={item.rating} reviewCount={item.reviewCount} size="sm" />
        </div>

        <div className="flex items-center gap-2 text-[10px] text-[#666]">
          <span className="flex items-center gap-0.5">
            <Clock size={10} />
            {item.preparationTime} {locale === "fa" ? "دقیقه" : "min"}
          </span>
          {item.spicyLevel > 0 && (
            <span className="flex items-center gap-0.5">
              <Flame size={10} className="text-red-400" />
              {item.spicyLevel}
            </span>
          )}
          {item.isVegetarian && (
            <span className="flex items-center gap-0.5">
              <Leaf size={10} className="text-green-400" />
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#1e1e1e]">
          <Price amount={item.basePrice} locale={locale} size="md" />

          {item.available && (
            <motion.button
              whileTap={{ scale: 0.85 }}
                onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onAddToCart?.(item);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-colors"
            >
              <Plus size={18} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
