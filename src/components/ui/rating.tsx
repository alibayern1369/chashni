"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  rating: number;
  reviewCount: number;
  size?: "sm" | "md";
  className?: string;
}

export function Rating({ rating, reviewCount, size = "sm", className }: RatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Star size={size === "sm" ? 10 : 12} className="fill-amber-400 text-amber-400" />
      <span className={cn("font-semibold text-amber-400", size === "sm" ? "text-[10px]" : "text-xs")}>
        {rating}
      </span>
      <span className={cn("text-[#555]", size === "sm" ? "text-[9px]" : "text-[10px]")}>
        ({reviewCount})
      </span>
    </div>
  );
}
