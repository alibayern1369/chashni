"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, RefreshCw, X } from "lucide-react";
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

const CANCELLABLE: DBOrderStatus[] = ["received", "confirmed", "preparing", "ready"];

const PAYMENT_LABELS: Record<string, { fa: string; en: string; color: string }> = {
  unpaid: { fa: "پرداخت‌نشده", en: "Unpaid", color: "text-[#888]" },
  pending: { fa: "در انتظار پرداخت", en: "Pending", color: "text-amber-400" },
  paid: { fa: "پرداخت‌شده", en: "Paid", color: "text-emerald-400" },
  failed: { fa: "ناموفق", en: "Failed", color: "text-red-400" },
  refunded: { fa: "بازگشت وجه", en: "Refunded", color: "text-sky-400" },
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
  payment_status?: string;
  notes?: string | null;
  created_at: string;
  table?: { id: string; number: number; name: string | null } | null;
}

export default function AdminOrdersPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { menuItems } = useMenuContext();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<DBOrderStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [canAdvance, setCanAdvance] = useState(true);

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [res, accessRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/access"),
      ]);
      if (accessRes.ok) {
        const access = await accessRes.json();
        setCanAdvance(
          access.role !== "kitchen" || access.kitchenCanAdvance !== false,
        );
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load orders");
        return;
      }
      setOrders(data.orders ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const t = setInterval(() => loadOrders(true), 15000);
    return () => clearInterval(t);
  }, [loadOrders]);

  const setStatus = async (orderId: string, status: DBOrderStatus) => {
    setBusyId(orderId);
    try {
      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
        );
      } else {
        const data = await res.json();
        setError(data?.error || "Status update failed");
      }
    } finally {
      setBusyId(null);
    }
  };

  const statusCount = (s: DBOrderStatus) =>
    orders.filter((o) => o.status === s).length;

  const summaryStatuses: DBOrderStatus[] = [
    "received",
    "confirmed",
    "preparing",
    "ready",
    "served",
    "completed",
  ];

  const visible =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

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
          onClick={() => loadOrders()}
          className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#1e1e1e] px-3 py-2 text-xs text-[#ccc]"
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          {isRtl ? "به‌روزرسانی" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {summaryStatuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter((prev) => (prev === s ? "all" : s))}
            className={cn(
              "rounded-2xl border bg-[#141414] p-4 text-center transition-colors",
              filter === s ? "border-amber-500/50" : "border-[#1e1e1e] hover:border-[#333]",
            )}
          >
            <p className="text-3xl font-black text-[#faf5e4]">{statusCount(s)}</p>
            <p
              className={cn(
                "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                STATUS_LABELS[s].color,
              )}
            >
              {isRtl ? STATUS_LABELS[s].fa : STATUS_LABELS[s].en}
            </p>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-10 text-center text-sm text-[#888]">
          {isRtl ? "سفارشی برای نمایش نیست" : "No orders to show"}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((order) => {
            const label = STATUS_LABELS[order.status] ?? STATUS_LABELS.received;
            const next = NEXT_STATUS[order.status];
            const pay =
              PAYMENT_LABELS[order.payment_status || "unpaid"] ?? PAYMENT_LABELS.unpaid;
            const canCancel = canAdvance && CANCELLABLE.includes(order.status);
            return (
              <div
                key={order.id}
                className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#faf5e4]">
                      #{order.order_number}
                      {order.customer_name ? ` — ${order.customer_name}` : ""}
                      {order.table
                        ? ` · ${isRtl ? "میز" : "Table"} ${order.table.number}`
                        : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-[#666]">
                      {new Date(order.created_at).toLocaleString(isRtl ? "fa-IR" : "en-US")}
                      {" · "}
                      <span className={pay.color}>{isRtl ? pay.fa : pay.en}</span>
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
                      ? isRtl
                        ? mi.nameFa
                        : mi.nameEn
                      : item.name || item.menuItemId;
                    return (
                      <div key={i} className="flex justify-between">
                        <span>
                          {item.quantity}x {itemName}
                        </span>
                        <span className="tabular-nums">
                          {formatPrice(item.totalPrice, locale)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {order.notes && (
                  <p className="mt-2 text-[11px] italic text-amber-400/80">{order.notes}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#1e1e1e] pt-3">
                  <span className="text-sm font-bold text-[#faf5e4]">
                    {isRtl ? "مجموع" : "Total"}:{" "}
                    <span className="text-amber-400">
                      {formatPrice(order.total, locale)}
                    </span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {canCancel && (
                      <button
                        disabled={busyId === order.id}
                        onClick={() => {
                          if (
                            window.confirm(
                              isRtl ? "لغو این سفارش؟" : "Cancel this order?",
                            )
                          ) {
                            setStatus(order.id, "cancelled");
                          }
                        }}
                        className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 disabled:opacity-50"
                      >
                        <X size={12} />
                        {isRtl ? "لغو" : "Cancel"}
                      </button>
                    )}
                    {next && canAdvance && (
                      <button
                        disabled={busyId === order.id}
                        onClick={() => setStatus(order.id, next)}
                        className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-50"
                      >
                        {isRtl
                          ? `انتقال به: ${STATUS_LABELS[next].fa}`
                          : `Move to ${STATUS_LABELS[next].en}`}
                      </button>
                    )}
                    {!canAdvance && (
                      <span className="text-[11px] text-[#666]">
                        {isRtl ? "فقط مشاهده" : "View only"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
