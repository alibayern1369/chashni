"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useMenuContext } from "@/lib/providers/data-provider";
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

const NEXT_STATUS: Record<DBOrderStatus, DBOrderStatus | null> = {
  received: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "served",
  served: "completed",
  completed: null,
  cancelled: null,
};

interface AdminOrder {
  id: string;
  order_number: number;
  status: DBOrderStatus;
  order_type: string;
  items: OrderItemSnapshot[];
  total: number;
  customer_name: string | null;
  table_id: string | null;
  created_at: string;
}

export default function AdminOrdersPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { menuItems } = useMenuContext();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
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
    loadOrders();
  }, [loadOrders]);

  const advanceStatus = async (orderId: string, current: DBOrderStatus) => {
    const next = NEXT_STATUS[current];
    if (!next) return;
    const res = await fetch("/api/orders/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: next }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: next } : o)),
      );
    }
  };

  const statusCount = (s: DBOrderStatus) =>
    orders.filter((o) => o.status === s).length;

  if (loading && orders.length === 0) {
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
          {isRtl ? "سفارش‌ها" : "Orders"}
        </h2>
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

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["received", "preparing", "ready", "completed"] as DBOrderStatus[]).map((s) => (
          <div key={s} className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 text-center">
            <p className="text-3xl font-black text-[#faf5e4]">{statusCount(s)}</p>
            <p className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_LABELS[s].color)}>
              {isRtl ? STATUS_LABELS[s].fa : STATUS_LABELS[s].en}
            </p>
          </div>
        ))}
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-10 text-center text-sm text-[#888]">
          {isRtl ? "هنوز سفارشی ثبت نشده است" : "No orders yet"}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const label = STATUS_LABELS[order.status] ?? STATUS_LABELS.received;
            const next = NEXT_STATUS[order.status];
            return (
              <div key={order.id} className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#faf5e4]">
                      #{order.order_number} {order.customer_name ? `— ${order.customer_name}` : ""}
                    </p>
                    <p className="text-xs text-[#666] mt-0.5">
                      {new Date(order.created_at).toLocaleString(isRtl ? "fa-IR" : "en-US")}
                    </p>
                  </div>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", label.color)}>
                    {isRtl ? label.fa : label.en}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-[#888]">
                  {order.items.map((item: OrderItemSnapshot, i) => {
                    const mi = menuItems.find((m) => m.id === item.menuItemId);
                    const itemName = mi
                      ? isRtl ? mi.nameFa : mi.nameEn
                      : item.name || item.menuItemId;
                    return (
                      <div key={i} className="flex justify-between">
                        <span>{item.quantity}x {itemName}</span>
                        <span className="tabular-nums">{formatPrice(item.totalPrice, locale)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#1e1e1e] pt-3">
                  <span className="text-sm font-bold text-[#faf5e4]">
                    {isRtl ? "مجموع" : "Total"}:{" "}
                    <span className="text-amber-400">{formatPrice(order.total, locale)}</span>
                  </span>
                  {next && (
                    <button
                      onClick={() => advanceStatus(order.id, order.status)}
                      className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition-colors"
                    >
                      {isRtl ? `انتقال به: ${STATUS_LABELS[next].fa}` : `Move to ${STATUS_LABELS[next].en}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
