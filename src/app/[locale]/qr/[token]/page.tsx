"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/lib/types";

/**
 * Resolves a table QR token and redirects to the menu with ?table=N
 */
export default function QrTokenPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "fa";
  const token = params.token as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/tables/resolve?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data?.error || "Invalid QR");
          return;
        }
        const tableNum = String(data.table.number).padStart(2, "0");
        router.replace(`/${locale}/menu?table=${tableNum}`);
      } catch {
        if (!cancelled) setError("Failed to resolve QR");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, locale, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => router.push(`/${locale}/menu`)}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-black"
        >
          {locale === "fa" ? "رفتن به منو" : "Go to menu"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 size={28} className="animate-spin text-amber-400" />
    </div>
  );
}
