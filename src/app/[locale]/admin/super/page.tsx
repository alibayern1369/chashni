"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, RefreshCw, TrendingUp, Store, ShoppingBag, Users, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface Stats {
  tenants: number;
  members: number;
  orders: number;
  menuItems: number;
  categories: number;
  profiles: number;
  openOrders: number;
  revenue: number;
}

export default function SuperDashboardPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/super/stats");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load stats");
        return;
      }
      setStats(data.stats);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const cards = stats
    ? [
        { label: isRtl ? "تننت‌ها" : "Tenants", value: stats.tenants, icon: <Store size={20} />, color: "text-amber-400" },
        { label: isRtl ? "کاربران" : "Users", value: stats.profiles, icon: <Users size={20} />, color: "text-sky-400" },
        { label: isRtl ? "سفارش‌ها" : "Orders", value: stats.orders, icon: <ShoppingBag size={20} />, color: "text-emerald-400" },
        { label: isRtl ? "سفارش‌های باز" : "Open Orders", value: stats.openOrders, icon: <TrendingUp size={20} />, color: "text-red-400" },
        { label: isRtl ? "اعضای تننت" : "Members", value: stats.members, icon: <Users size={20} />, color: "text-violet-400" },
        { label: isRtl ? "آیتم‌های منو" : "Menu Items", value: stats.menuItems, icon: <Package size={20} />, color: "text-amber-400" },
      ]
    : [];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#faf5e4]">
          {isRtl ? "داشبورد پلتفرم" : "Platform Dashboard"}
        </h2>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#333] px-3 py-2 text-xs text-[#ccc] hover:border-[#444]"
        >
          <RefreshCw size={14} />
          {isRtl ? "به‌روزرسانی" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {stats && (
        <>
          <div className="rounded-2xl bg-gradient-to-br from-[#1c1408] to-[#141414] border border-[#2a2010] p-6">
            <p className="text-xs font-semibold text-[#888] uppercase tracking-wider">
              {isRtl ? "درآمد کل (بدون سفارش‌های لغو شده)" : "Total Revenue (excl. cancelled)"}
            </p>
            <p className="mt-2 text-3xl sm:text-4xl font-black text-amber-400">
              {formatPrice(stats.revenue, locale)}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {cards.map((card) => (
              <div key={card.label} className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 text-center">
                <div className={`mx-auto mb-2 ${card.color}`}>{card.icon}</div>
                <p className="text-2xl font-black text-[#faf5e4]">{card.value}</p>
                <p className="text-[10px] text-[#888] mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/admin/super/tenants`}
              className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400"
            >
              {isRtl ? "مدیریت تننت‌ها" : "Manage Tenants"}
            </Link>
            <Link
              href={`/${locale}/admin/super/users`}
              className="rounded-xl bg-[#1e1e1e] border border-[#333] px-5 py-2.5 text-sm font-medium text-[#ccc] hover:border-amber-500/30 hover:text-amber-400"
            >
              {isRtl ? "مدیریت کاربران" : "Manage Users"}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}