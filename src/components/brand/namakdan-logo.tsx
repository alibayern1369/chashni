"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NamakdanLogoProps {
  href?: string;
  showWordmark?: boolean;
  locale?: "fa" | "en";
  className?: string;
  size?: number;
}

export function NamakdanLogo({
  href = "/r/chashni",
  showWordmark = true,
  locale = "fa",
  className,
  size = 40,
}: NamakdanLogoProps) {
  const mark = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/namakdan/logo.svg"
        alt={locale === "fa" ? "لوگوی نمکدان" : "Namakdan logo"}
        width={size}
        height={size}
        className="shrink-0 rounded-xl shadow-[0_8px_24px_rgba(168,230,207,0.18)]"
      />
      {showWordmark && (
        <span className="leading-tight">
          <span className="block text-base font-black tracking-tight text-[var(--color-text)]">
            {locale === "fa" ? "نمکدان" : "Namakdan"}
          </span>
          <span className="block text-[10px] font-medium tracking-wide text-[var(--pastel-mint)]">
            {locale === "fa" ? "Namakdan" : "نمکدان"}
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return mark;

  return (
    <Link
      href={href}
      className="inline-flex items-center transition-opacity hover:opacity-90"
    >
      {mark}
    </Link>
  );
}
