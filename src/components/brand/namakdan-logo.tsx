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
  size = 36,
}: NamakdanLogoProps) {
  const mark = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/namakdan/logo.svg"
        alt=""
        width={size}
        height={size}
        className="rounded-lg shrink-0"
      />
      {showWordmark && (
        <span className="leading-tight">
          <span className="block text-base font-black tracking-tight text-[#faf5e4]">
            {locale === "fa" ? "نمکدان" : "Namakdan"}
          </span>
          <span className="block text-[10px] font-medium text-[#888] tracking-wide">
            {locale === "fa" ? "Namakdan" : "نمکدان"}
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
      {mark}
    </Link>
  );
}
