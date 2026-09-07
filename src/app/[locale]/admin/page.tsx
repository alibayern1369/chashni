"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Loader2, Receipt, ChefHat, TrendingUp, AlertCircle } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import {
  DEFAULT_TENANT_SLUG,
  restaurantPath,
  tenantSlugFromPathname,
} from "@/lib/routes";
import type { Locale } from "@/lib/types";

type Stats = {
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

const STATUS_FA: Record<string, string> = {
  received: "دریافت",
  confirmed: "تأیید",
  preparing: "آماده‌سازی",
  ready: "آماده",
  served: "سرو",
  completed: "تکمیل",
  cancelled: "لغو",
};

export default function AdminHomePage() {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const slug = tenantSlugFromPathname(pathname) || DEFAULT_TENANT_SLUG;

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, accessRes] = await Promise.all([
        fetch("/api/admin/stats?range=today"),
        fetch("/api/admin/access"),
      ]);
      if (accessRes.ok) {
        const a = await accessRes.json();
        setRole(a.role);
        if (a.role === "kitchen") {
          // Kitchen lands on kitchen page via shell guard; still show minimal
        }
      }
      const data = await statsRes.json();
      if (!statsRes.ok) {
        setError(data?.error || "Failed");
        return;
      }
      setStats(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !stats) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  const s = stats!.summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#faf5e4]">
          {isRtl ? "خانه" : "Home"}
        </h1>
        <p className="mt-1 text-sm text-[#888]">
          {isRtl ? "خلاصه وضعیت امروز رستوران" : "Today’s restaurant overview"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: isRtl ? "سفارش فعال" : "Active orders",
            value: String(s.activeCount),
            icon: <AlertCircle size={16} className="text-amber-400" />,
          },
          {
            label: isRtl ? "فروش امروز" : "Sales today",
            value: formatPrice(s.sales, locale),
            icon: <TrendingUp size={16} className="text-emerald-400" />,
          },
          {
            label: isRtl ? "تکمیل‌شده" : "Completed",
            value: String(s.completed),
            icon: <Receipt size={16} className="text-sky-400" />,
          },
          {
            label: isRtl ? "میانگین فاکتور" : "Avg ticket",
            value: formatPrice(s.avgTicket, locale),
            icon: <TrendingUp size={16} className="text-[#888]" />,
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-[11px] text-[#666]">
              {c.icon}
              {c.label}
            </div>
            <p className="text-xl font-black text-[#faf5e4]">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={restaurantPath("/admin/orders", slug)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-400"
        >
          <Receipt size={16} />
          {isRtl ? "سفارش‌ها" : "Orders"}
        </Link>
        <Link
          href={restaurantPath("/admin/kitchen", slug)}
          className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#1e1e1e] px-4 py-2.5 text-sm font-medium text-[#ccc] hover:border-amber-500/40"
        >
          <ChefHat size={16} />
          {isRtl ? "آشپزخانه" : "Kitchen"}
        </Link>
        {role !== "kitchen" && (
          <Link
            href={restaurantPath("/admin/reports", slug)}
            className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#1e1e1e] px-4 py-2.5 text-sm font-medium text-[#ccc] hover:border-amber-500/40"
          >
            <TrendingUp size={16} />
            {isRtl ? "گزارش‌ها" : "Reports"}
          </Link>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-5">
          <h2 className="mb-3 text-sm font-bold text-[#ccc]">
            {isRtl ? "وضعیت سفارش‌ها" : "Orders by status"}
          </h2>
          <div className="space-y-2">
            {Object.entries(stats!.byStatus).map(([st, n]) => (
              <div key={st} className="flex items-center justify-between text-sm">
                <span className="text-[#888]">
                  {isRtl ? STATUS_FA[st] || st : st}
                </span>
                <span className="font-bold text-[#faf5e4]">{n}</span>
              </div>
            ))}
            {Object.keys(stats!.byStatus).length === 0 && (
              <p className="text-sm text-[#666]">
                {isRtl ? "سفارشی امروز ثبت نشده" : "No orders today"}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-5">
          <h2 className="mb-3 text-sm font-bold text-[#ccc]">
            {isRtl ? "پرفروش‌های امروز" : "Top items today"}
          </h2>
          <div className="space-y-2">
            {stats!.topItems.map((it) => (
              <div key={it.name} className="flex items-center justify-between text-sm">
                <span className="truncate text-[#888]">{it.name}</span>
                <span className={cn("shrink-0 font-bold text-amber-400")}>
                  ×{it.qty}
                </span>
              </div>
            ))}
            {stats!.topItems.length === 0 && (
              <p className="text-sm text-[#666]">
                {isRtl ? "داده‌ای نیست" : "No data"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
