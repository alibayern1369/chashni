"use client";

import { useParams } from "next/navigation";
import { BurgerBuilder } from "@/components/burger-builder/burger-builder";
import type { Locale } from "@/lib/types";

export default function BuildBurgerPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-2xl text-center mb-8">
        <span className="text-4xl mb-3 block">🍔</span>
        <h1 className="text-2xl font-bold text-[#faf5e4] mb-2">
          {isRtl ? "برگر خودتو بساز" : "Build Your Burger"}
        </h1>
        <p className="text-sm text-[#888]">
          {isRtl
            ? "هر ترکیبی که دوست داری انتخاب کن"
            : "Choose whatever combination you like"}
        </p>
      </div>

      <BurgerBuilder />
    </div>
  );
}
