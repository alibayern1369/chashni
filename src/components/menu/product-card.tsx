"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Flame } from "lucide-react";
import { useLocaleContext } from "@/lib/providers/locale-provider";
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
  const [imgError, setImgError] = useState(false);

  const name = locale === "fa" ? item.nameFa : item.nameEn;
  const desc = locale === "fa" ? item.descFa : item.descEn;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpenDetail?.(item)}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-[1.5rem] transition-all duration-300",
        "glass hover:border-white/18",
        className,
      )}
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        {imgError || !item.image ? (
          <div className="flex h-full w-full items-center justify-center bg-white/5 text-4xl">
            🍽️
          </div>
        ) : (
          <img
            src={item.image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07090c]/90 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5">
          {item.isBestseller && (
            <Badge variant="bestseller">{locale === "fa" ? "پرفروش" : "Bestseller"}</Badge>
          )}
          {item.isNew && <Badge variant="new">{locale === "fa" ? "جدید" : "New"}</Badge>}
          {item.isChefPick && (
            <Badge variant="chefPick">{locale === "fa" ? "ویژه سرآشپز" : "Chef's Pick"}</Badge>
          )}
          {item.isVegetarian && (
            <Badge variant="vegetarian">{locale === "fa" ? "گیاهی" : "Veggie"}</Badge>
          )}
        </div>

        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <span className="text-sm font-semibold text-white">
              {locale === "fa" ? "موجود نیست" : "Unavailable"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-1 text-[15px] font-bold tracking-tight text-[var(--color-text)]">
          {name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-[var(--color-text-muted)]">
          {desc}
        </p>

        <div className="mt-auto flex items-center gap-2">
          <Rating rating={item.rating} reviewCount={item.reviewCount} size="sm" />
        </div>

        <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-1">
            <Clock size={11} />
            {item.preparationTime} {locale === "fa" ? "دقیقه" : "min"}
          </span>
          {item.spicyLevel > 0 && (
            <span className="inline-flex items-center gap-1 text-[var(--pastel-rose)]">
              <Flame size={11} />
              {item.spicyLevel}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/8 pt-3">
          <Price amount={item.basePrice} locale={locale} size="md" />

          {item.available && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onAddToCart?.(item);
              }}
              className="btn-namakdan flex h-10 w-10 items-center justify-center rounded-xl"
              aria-label={locale === "fa" ? "افزودن" : "Add"}
            >
              <Plus size={18} strokeWidth={2.5} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
