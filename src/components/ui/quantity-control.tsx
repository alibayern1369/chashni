"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
  className?: string;
}

export function QuantityControl({ value, onChange, size = "md", className }: QuantityControlProps) {
  const btnSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const iconSize = size === "sm" ? 12 : 14;
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        onClick={() => onChange(value - 1)}
        className={cn(
          "flex items-center justify-center rounded-lg bg-[#1e1e1e] border border-[#333] text-[#888] hover:text-[#ccc] transition-colors",
          btnSize
        )}
      >
        <Minus size={iconSize} />
      </button>
      <span className={cn("w-6 text-center font-bold text-[#faf5e4] tabular-nums", textSize)}>
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className={cn(
          "flex items-center justify-center rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors",
          btnSize
        )}
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
}
