"use client";

import { Clock, MapPin, CircleDot } from "lucide-react";
import { useMenuContext } from "@/lib/providers/data-provider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface RestaurantStatusProps {
  locale?: Locale;
  isOpen?: boolean;
  estimatedTime?: number;
  className?: string;
}

export function RestaurantStatus({
  locale = "fa",
  isOpen = true,
  estimatedTime,
  className,
}: RestaurantStatusProps) {
  const { restaurant } = useMenuContext();
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
          isOpen
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
            : "bg-red-500/15 text-red-400 border border-red-500/20"
        )}
      >
        <CircleDot size={10} className={isOpen ? "animate-pulse" : ""} />
        {isOpen
          ? locale === "fa" ? "باز" : "Open"
          : locale === "fa" ? "بسته" : "Closed"}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[#888]">
        <Clock size={12} />
        {restaurant.hours.open} – {restaurant.hours.close}
      </div>

      {estimatedTime && estimatedTime > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-[#888]">
          <MapPin size={12} />
          {locale === "fa"
            ? `زمان تقریبی: ${estimatedTime} دقیقه`
            : `Est. time: ${estimatedTime} min`}
        </div>
      )}
    </div>
  );
}
