"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  variant: "bestseller" | "new" | "chefPick" | "vegetarian";
  children?: ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  bestseller: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  new: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  chefPick: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
  vegetarian: "bg-green-500/15 text-green-400 border border-green-500/20",
};

const defaultLabels: Record<string, string> = {
  bestseller: "⭐ Bestseller",
  new: "✨ New",
  chefPick: "👨‍🍳 Chef's Pick",
  vegetarian: "🌱 Veggie",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm",
        variantStyles[variant],
        className
      )}
    >
      {children || defaultLabels[variant]}
    </span>
  );
}
