"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import {
  useOrders,
  updateOrderStatus,
  clearAllOrders,
} from "@/lib/hooks/use-orders";
import { menuItems, burgerOptions } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const statusLabels: Record<OrderStatus, { fa: string; en: string; color: string }> = {
  received: { fa: "دریافت شد", en: "Received", color: "bg-blue-500/15 text-blue-400" },
  preparing: { fa: "در حال آماده‌سازی", en: "Preparing", color: "bg-amber-500/15 text-amber-400" },
  ready: { fa: "آماده تحویل", en: "Ready", color: "bg-emerald-500/15 text-emerald-400" },
  completed: { fa: "تکمیل شد", en: "Completed", color: "bg-[#222] text-[#666]" },
};

const statusOrder: OrderStatus[] = ["received", "preparing", "ready", "completed"];

function safeFormatTime(date: Date): string {
  try {
    const d = new Date(date);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  } catch {
    return "--:--";
  }
}

function resolveOptionLabel(catId: string, optId: string): string {
  const cat = burgerOptions.find((c) => c.id === catId);
  const opt = cat?.options.find((o) => o.id === optId);
  return opt?.nameEn ?? optId;
}

export default function OrdersPage() {
  const orders = useOrders();
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredOrders = useMemo(
    () =>
      activeStatus === "all"
        ? orders
        : orders.filter((o) => o.status === activeStatus),
    [orders, activeStatus]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-[#888]">Manage and update incoming orders</p>
      </div>

      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveStatus("all")}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
            activeStatus === "all"
              ? "bg-amber-500 text-black"
              : "bg-[#141414] text-[#666] hover:text-[#aaa]"
          )}
        >
          All ({orders.length})
        </button>
        {statusOrder.map((status) => {
          const info = statusLabels[status];
          const count = orders.filter((o) => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                activeStatus === status
                  ? "bg-amber-500 text-black"
                  : "bg-[#141414] text-[#666] hover:text-[#aaa]"
              )}
            >
              {info.en} ({count})
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          onClick={() => setShowClearConfirm(true)}
          disabled={orders.length === 0}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"
        >
          <Trash2 size={12} /> Clear All
        </button>
      </div>

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-6 flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-red-400">
              Are you sure you want to clear all {orders.length} orders? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  clearAllOrders();
                  setShowClearConfirm(false);
                }}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white"
              >
                Yes, clear all
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg bg-[#1e1e1e] px-3 py-1.5 text-xs font-bold text-[#888]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-12 text-center">
          <p className="text-sm text-[#555]">
            {orders.length === 0
              ? "No orders yet"
              : "No orders in this category"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const info = statusLabels[order.status];
            const curIdx = statusOrder.indexOf(order.status);
            const prevStatus = curIdx > 0 ? statusOrder[curIdx - 1] : null;
            const nextStatus = curIdx < statusOrder.length - 1 ? statusOrder[curIdx + 1] : null;
            const isExpanded = expanded === order.id;
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : order.id)}
                      className="shrink-0 rounded-lg p-1 text-[#666] transition-colors hover:bg-[#1e1e1e] hover:text-[#ccc]"
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#ccc]">
                          #{order.id}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${info.color}`}>
                          {info.en}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#555]">
                        {safeFormatTime(order.createdAt)} ·{" "}
                        {order.orderType === "dine-in" ? `Table ${order.table ?? "-"}` : "Takeaway"}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="text-base font-black text-amber-400 tabular-nums">
                      {formatPrice(order.total, "en")}
                    </p>
                    <p className="text-[10px] text-[#666]">{order.items.length} items</p>
                  </div>
                </div>

                {order.customerName != null && (
                  <p className="mt-2 pl-4 text-xs text-[#888]">
                    Customer: {order.customerName}
                    {order.customerPhone ? ` · ${order.customerPhone}` : ""}
                  </p>
                )}
                {order.notes && (
                  <p className="mt-1 pl-4 text-xs italic text-[#666]">Note: {order.notes}</p>
                )}

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 space-y-1.5 rounded-xl bg-[#0a0a0a] p-3"
                  >
                    {order.items.map((item, i) => {
                      if (item.menuItemId === "custom-burger" && item.customBurger) {
                        const b = item.customBurger;
                        return (
                          <div key={i} className="pb-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-400">
                                {b.name || "Custom Burger"} × {item.quantity}
                              </span>
                            </div>
                            <div className="mt-1 space-y-1 text-[11px] text-[#888]">
                              {b.bun && (
                                <p>Bun: <span className="text-[#ccc]">{resolveOptionLabel("bun", b.bun)}</span></p>
                              )}
                              {b.patty && (
                                <p>Patty: <span className="text-[#ccc]">{resolveOptionLabel("patty", b.patty)}</span></p>
                              )}
                              {b.cheese?.length > 0 && (
                                <p>Cheese: <span className="text-[#ccc]">{b.cheese.map((c) => resolveOptionLabel("cheese", c)).join(", ")}</span></p>
                              )}
                              {b.toppings?.length > 0 && (
                                <p>Toppings: <span className="text-[#ccc]">{b.toppings.map((t) => resolveOptionLabel("toppings", t)).join(", ")}</span></p>
                              )}
                              {b.sauce?.length > 0 && (
                                <p>Sauce: <span className="text-[#ccc]">{b.sauce.map((s) => resolveOptionLabel("sauce", s)).join(", ")}</span></p>
                              )}
                            </div>
                          </div>
                        );
                      }
                      const mi = menuItems.find((m) => m.id === item.menuItemId);
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-xs text-[#666]">
                            {mi ? mi.nameEn : item.menuItemId} × {item.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    {prevStatus && (
                      <button
                        onClick={() => updateOrderStatus(order.id, prevStatus)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#333] bg-[#1e1e1e] px-3 py-1.5 text-xs font-bold text-[#888] transition-colors hover:border-[#555] hover:text-[#ccc]"
                      >
                        <ArrowLeft size={12} /> {statusLabels[prevStatus].en}
                      </button>
                    )}
                    {nextStatus && (
                      <button
                        onClick={() => updateOrderStatus(order.id, nextStatus)}
                        className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 transition-colors hover:bg-amber-500/20"
                      >
                        {statusLabels[nextStatus].en} <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
