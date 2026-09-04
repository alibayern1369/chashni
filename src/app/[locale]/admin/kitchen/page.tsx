"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, RefreshCw, ChefHat } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { Locale, DBOrderStatus, OrderItemSnapshot } from "@/lib/types";

const KITCHEN_QUEUE: DBOrderStatus[] = ["received", "confirmed", "preparing"];
const NEXT_LABEL: Partial<Record<DBOrderStatus, { fa: string; en: string }>> = {
  received: { fa: "تأیید سفارش", en: "Confirm order" },
  confirmed: { fa: "شروع پخت", en: "Start cooking" },
  preparing: { fa: "آماده شد", en: "Mark ready" },
};

const NEXT_STATUS: Partial<Record<DBOrderStatus, DBOrderStatus>> = {
  received: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
};

interface KitchenOrder {
  id: string;
  order_number: number;
  status: DBOrderStatus;
  order_type: string;
  items: OrderItemSnapshot[];
  total: number;
  customer_name: string | null;
  notes: string | null;
  created_at: string;
  table: { id: string; number: number; name: string | null } | null;
}

export default function KitchenDisplayPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
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
      const all = (data.orders ?? []) as KitchenOrder[];
      setOrders(all.filter((o) => KITCHEN_QUEUE.includes(o.status)));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const t = setInterval(loadOrders, 15000);
    return () => clearInterval(t);
  }, [loadOrders]);

  const advance = async (id: string, status: DBOrderStatus) => {
    const next = NEXT_STATUS[status];
    if (!next) return;
    const res = await fetch("/api/orders/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id, status: next }),
    });
    if (res.ok) {
      if (next === "ready") {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      } else {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
      }
    }
  };

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
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#faf5e4]">
          <ChefHat size={20} className="text-amber-400" />
          {isRtl ? "صفحه آشپزخانه" : "Kitchen Display"}
          <span className="rounded-full bg-amber-500/15 text-amber-400 px-2.5 py-0.5 text-xs font-bold ml-2">
            {orders.length}
          </span>
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

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-10 text-center text-sm text-[#888]">
          {isRtl ? "سفارش فعالی وجود ندارد 🎉" : "No active orders 🎉"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => {
            const label = NEXT_LABEL[order.status];
            const urgent = order.status === "received";
            return (
              <div
                key={order.id}
                className={cn(
                  "rounded-2xl bg-[#141414] border p-4 flex flex-col",
                  urgent ? "border-red-500/40" : "border-[#1e1e1e]",
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-2xl font-black", urgent ? "text-red-400" : "text-[#faf5e4]")}>
                      #{order.order_number}
                    </p>
                    <p className="text-xs text-[#666] mt-0.5">
                      {order.table
                        ? `${isRtl ? "میز" : "Table"} ${order.table.number}`
                        : order.order_type === "dine-in"
                          ? isRtl ? "داخل سالن" : "Dine-in"
                          : isRtl ? "برون‌بر" : "Takeaway"}
                      {order.customer_name ? ` • ${order.customer_name}` : ""}
                    </p>
                  </div>
                  <p className="text-[10px] text-[#666]">
                    {new Date(order.created_at).toLocaleTimeString(isRtl ? "fa-IR" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="mt-3 flex-1 space-y-1.5 border-y border-[#1e1e1e] py-3">
                  {order.items.map((item: OrderItemSnapshot, i) => (
                    <div key={i}>
                      <p className="text-sm text-[#faf5e4]">
                        <span className="font-bold text-amber-400">{item.quantity}x</span>{" "}
                        {item.name || item.menuItemId}
                      </p>
                      {item.customBurger && (
                        <p className="text-[11px] text-[#666] pl-3">
                          {[
                            item.customBurger.bun,
                            item.customBurger.patty,
                            ...item.customBurger.cheese,
                            ...item.customBurger.toppings,
                            ...item.customBurger.sauce,
                          ].join("+")}
                        </p>
                      )}
                      {item.note && (
                        <p className="text-[11px] italic text-amber-400/80">📝 {item.note}</p>
                      )}
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <p className="mt-2 text-[11px] italic text-amber-400/80">📝 سفارش: {order.notes}</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#666]">
                    {isRtl ? "مجموع" : "Total"}:{" "}
                    <span className="font-bold text-[#faf5e4]">{formatPrice(order.total, locale)}</span>
                  </span>
                  {label && (
                    <button
                      onClick={() => advance(order.id, order.status)}
                      className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400"
                    >
                      {isRtl ? label.fa : label.en}
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