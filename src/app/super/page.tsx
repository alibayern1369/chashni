"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw, TrendingUp, Store, ShoppingBag, Users, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { superPath } from "@/lib/routes";

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
        setError(data?.error || "خطا در بارگذاری آمار");
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
        { label: "رستوران‌ها", value: stats.tenants, icon: <Store size={20} />, color: "text-amber-400" },
        { label: "کاربران", value: stats.profiles, icon: <Users size={20} />, color: "text-sky-400" },
        { label: "سفارش‌ها", value: stats.orders, icon: <ShoppingBag size={20} />, color: "text-emerald-400" },
        { label: "سفارش‌های باز", value: stats.openOrders, icon: <TrendingUp size={20} />, color: "text-red-400" },
        { label: "اعضای رستوران", value: stats.members, icon: <Users size={20} />, color: "text-violet-400" },
        { label: "آیتم‌های منو", value: stats.menuItems, icon: <Package size={20} />, color: "text-amber-400" },
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
        <h2 className="text-lg font-bold text-[#faf5e4]">داشبورد پلتفرم</h2>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#1e1e1e] px-3 py-2 text-xs text-[#ccc]"
        >
          <RefreshCw size={14} />
          به‌روزرسانی
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {stats && (
        <>
          <div className="rounded-2xl border border-[#2a2010] bg-gradient-to-br from-[#1c1408] to-[#141414] p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#888]">
              درآمد کل (بدون لغو شده‌ها)
            </p>
            <p className="mt-2 text-3xl font-black text-amber-400 sm:text-4xl">
              {formatPrice(stats.revenue, "fa")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-4 text-center"
              >
                <div className={`mx-auto mb-2 ${card.color}`}>{card.icon}</div>
                <p className="text-2xl font-black text-[#faf5e4]">{card.value}</p>
                <p className="mt-1 text-[10px] text-[#888]">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={superPath("/tenants")}
              className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400"
            >
              مدیریت رستوران‌ها
            </Link>
            <Link
              href={superPath("/users")}
              className="rounded-xl border border-[#333] bg-[#1e1e1e] px-5 py-2.5 text-sm font-medium text-[#ccc] hover:border-amber-500/30 hover:text-amber-400"
            >
              مدیریت کاربران
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
