"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, RefreshCw, History } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-provider";
import type { Locale, DBOrderStatus, OrderItemSnapshot } from "@/lib/types";

const STATUS_LABELS: Record<DBOrderStatus, { fa: string; en: string; color: string }> = {
  received: { fa: "دریافت شد", en: "Received", color: "bg-blue-500/15 text-blue-400" },
  confirmed: { fa: "تأیید شد", en: "Confirmed", color: "bg-sky-500/15 text-sky-400" },
  preparing: { fa: "در حال آماده‌سازی", en: "Preparing", color: "bg-amber-500/15 text-amber-400" },
  ready: { fa: "آماده تحویل", en: "Ready", color: "bg-emerald-500/15 text-emerald-400" },
  served: { fa: "سرو شد", en: "Served", color: "bg-teal-500/15 text-teal-400" },
  completed: { fa: "تکمیل شد", en: "Completed", color: "bg-[#222] text-[#666]" },
  cancelled: { fa: "لغو شد", en: "Cancelled", color: "bg-red-500/15 text-red-400" },
};

interface MyOrder {
  id: string;
  order_number: number;
  status: DBOrderStatus;
  order_type: string;
  items: OrderItemSnapshot[];
  total: number;
  created_at: string;
}

export default function MyOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/my");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load orders");
        return;
      }
      setOrders(data.orders ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/${locale}/login`);
    } else if (user) {
      loadOrders();
    }
  }, [authLoading, user, router, locale, loadOrders]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-16">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-xl font-black text-[#faf5e4]">
            <History size={20} className="text-amber-400" />
            {isRtl ? "سفارش‌های من" : "My Orders"}
          </h1>
          <button
            onClick={loadOrders}
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

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-10 text-center">
            <p className="text-sm text-[#888]">
              {isRtl ? "هنوز سفارشی ندارید" : "No orders yet"}
            </p>
            <Link
              href={`/${locale}/menu`}
              className="mt-4 inline-block rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400"
            >
              {isRtl ? "مشاهده منو" : "View menu"}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const label = STATUS_LABELS[order.status] ?? STATUS_LABELS.received;
              return (
                <div key={order.id} className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#faf5e4]">#{order.order_number}</p>
                    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", label.color)}>
                      {isRtl ? label.fa : label.en}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#666]">
                    {new Date(order.created_at).toLocaleString(isRtl ? "fa-IR" : "en-US")}
                  </p>
                  <div className="mt-3 space-y-1 border-t border-[#1e1e1e] pt-3 text-sm text-[#888]">
                    {order.items.map((item: OrderItemSnapshot, i) => (
                      <div key={i} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.name || item.menuItemId}
                        </span>
                        <span className="tabular-nums">{formatPrice(item.totalPrice, locale)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#1e1e1e] pt-3">
                    <span className="text-sm font-bold text-[#faf5e4]">
                      {isRtl ? "مجموع" : "Total"}:{" "}
                      <span className="text-amber-400">{formatPrice(order.total, locale)}</span>
                    </span>
                    <Link
                      href={`/${locale}/order/${order.id}`}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      {isRtl ? "جزئیات سفارش" : "Order details"} ←
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}