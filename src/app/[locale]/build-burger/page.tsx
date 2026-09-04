"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BurgerBuilder } from "@/components/burger-builder/burger-builder";
import type { Locale } from "@/lib/types";

export default function BuildBurgerPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/restaurant")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const mods: string[] = data?.tenant?.enabled_modules ?? [];
        if (mods.length > 0 && !mods.includes("builder")) {
          setAllowed(false);
          router.replace(`/${locale}/menu`);
        } else {
          setAllowed(true);
        }
      })
      .catch(() => setAllowed(true));
  }, [locale, router]);

  if (allowed === null || allowed === false) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-2xl text-center mb-8">
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
