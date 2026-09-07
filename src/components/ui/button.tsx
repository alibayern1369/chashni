"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}

const variantStyles: Record<string, string> = {
  primary: "btn-namakdan",
  secondary:
    "glass text-[var(--color-text)] hover:border-white/25 hover:bg-white/10",
  ghost: "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5",
};

const sizeStyles: Record<string, string> = {
  sm: "h-8 px-3 text-xs rounded-xl gap-1.5",
  md: "h-11 px-4 text-sm rounded-2xl gap-2",
  lg: "h-12 px-6 text-sm rounded-2xl gap-2",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  icon,
  iconPosition = "left",
  onClick,
  className,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-300",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        disabled && "cursor-not-allowed opacity-45",
        className,
      )}
    >
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </button>
  );
}
