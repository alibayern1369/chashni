"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { Locale } from "@/lib/types";

type Stats = {
  range: string;
  summary: {
    orderCount: number;
    activeCount: number;
    completed: number;
    cancelled: number;
    sales: number;
    paidSales: number;
    avgTicket: number;
  };
  byStatus: Record<string, number>;
  topItems: { name: string; qty: number; revenue: number }[];
};

const RANGES = [
  { id: "today", fa: "امروز", en: "Today" },
  { id: "7d", fa: "۷ روز", en: "7 days" },
  { id: "30d", fa: "۳۰ روز", en: "30 days" },
] as const;

const STATUS_FA: Record<string, string> = {
  received: "دریافت",
  confirmed: "تأیید",
  preparing: "آماده‌سازی",
  ready: "آماده",
  served: "سرو",
  completed: "تکمیل",
  cancelled: "لغو",
};

export default function AdminReportsPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [range, setRange] = useState<"today" | "7d" | "30d">("today");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stats?range=${range}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed");
        return;
      }
      setStats(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#faf5e4]">
          {isRtl ? "گزارش‌ها" : "Reports"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold",
                range === r.id
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-[#1e1e1e] text-[#666]",
              )}
            >
              {isRtl ? r.fa : r.en}
            </button>
          ))}
          <button
            onClick={load}
            className="rounded-xl border border-[#333] bg-[#1e1e1e] p-2 text-[#ccc]"
          >
            <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-amber-400" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                l: isRtl ? "تعداد سفارش" : "Orders",
                v: String(stats.summary.orderCount),
              },
              {
                l: isRtl ? "فروش" : "Sales",
                v: formatPrice(stats.summary.sales, locale),
              },
              {
                l: isRtl ? "پرداخت‌شده" : "Paid",
                v: formatPrice(stats.summary.paidSales, locale),
              },
              {
                l: isRtl ? "میانگین فاکتور" : "Avg ticket",
                v: formatPrice(stats.summary.avgTicket, locale),
              },
            ].map((c) => (
              <div
                key={c.l}
                className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-4"
              >
                <p className="text-[11px] text-[#666]">{c.l}</p>
                <p className="mt-1 text-xl font-black text-[#faf5e4]">{c.v}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-5">
              <h3 className="mb-3 text-sm font-bold text-[#ccc]">
                {isRtl ? "تفکیک وضعیت" : "By status"}
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.byStatus).map(([st, n]) => (
                  <div key={st} className="flex justify-between text-sm">
                    <span className="text-[#888]">
                      {isRtl ? STATUS_FA[st] || st : st}
                    </span>
                    <span className="font-bold">{n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-5">
              <h3 className="mb-3 text-sm font-bold text-[#ccc]">
                {isRtl ? "پرفروش‌ها" : "Top items"}
              </h3>
              <div className="space-y-2">
                {stats.topItems.map((it) => (
                  <div key={it.name} className="flex justify-between gap-3 text-sm">
                    <span className="truncate text-[#888]">{it.name}</span>
                    <span className="shrink-0 text-amber-400">
                      ×{it.qty} · {formatPrice(it.revenue, locale)}
                    </span>
                  </div>
                ))}
                {stats.topItems.length === 0 && (
                  <p className="text-sm text-[#666]">
                    {isRtl ? "داده‌ای نیست" : "No data"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
