import { cn, formatPrice } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface PriceProps {
  amount: number;
  locale: Locale;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
};

export function Price({ amount, locale, size = "md", className }: PriceProps) {
  return (
    <span className={cn("font-bold text-amber-400 tabular-nums", sizeClasses[size], className)}>
      {formatPrice(amount, locale)}
    </span>
  );
}
