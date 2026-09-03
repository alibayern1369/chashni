"use client";

import { useState } from "react";
import {
  useOrders,
  updateOrderStatus,
  clearAllOrders,
} from "@/lib/hooks/use-orders";
import { menuItems, categories } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const statusLabels: Record<OrderStatus, { fa: string; en: string; color: string }> = {
  received: { fa: "دریافت شد", en: "Received", color: "bg-blue-500/15 text-blue-400" },
  preparing: { fa: "در حال آماده‌سازی", en: "Preparing", color: "bg-amber-500/15 text-amber-400" },
  ready: { fa: "آماده تحویل", en: "Ready", color: "bg-emerald-500/15 text-emerald-400" },
  completed: { fa: "تکمیل شد", en: "Completed", color: "bg-[#222] text-[#666]" },
};

const statusOrder: OrderStatus[] = ["received", "preparing", "ready", "completed"];

export default function AdminPage() {
  const orders = useOrders();
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "all">("all");
  const [menuToggle, setMenuToggle] = useState(
    menuItems.map((item) => ({ ...item }))
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredOrders = activeStatus === "all" ? orders : orders.filter((o) => o.status === activeStatus);

  const toggleField = (id: string, field: "available" | "isBestseller" | "isNew") => {
    setMenuToggle((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter((o) => o.status !== "completed").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#faf5e4] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight mb-1">پنل مدیریت — Admin Dashboard</h1>
          <p className="text-sm text-[#888]">
            {orders.length} سفارش ثبت شده — {activeOrders} فعال — {formatPrice(totalRevenue, "fa")} درآمد
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {(["received", "preparing", "ready", "completed"] as const).map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            const info = statusLabels[status];
            return (
              <div
                key={status}
                className={`rounded-2xl border border-[#1e1e1e] p-4 ${count > 0 ? info.color : "text-[#555]"}`}
              >
                <p className="text-3xl font-black">{count}</p>
                <p className="text-xs font-semibold mt-1">{info.fa}</p>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveStatus("all")}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              activeStatus === "all"
                ? "bg-amber-500 text-black"
                : "bg-[#141414] text-[#666] hover:text-[#aaa]"
            }`}
          >
            همه ({orders.length})
          </button>
          {statusOrder.map((status) => {
            const info = statusLabels[status];
            const count = orders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  activeStatus === status
                    ? "bg-amber-500 text-black"
                    : "bg-[#141414] text-[#666] hover:text-[#aaa]"
                }`}
              >
                {info.fa} ({count})
              </button>
            );
          })}
          <div className="flex-1" />
          <button
            onClick={() => setShowClearConfirm(true)}
            className="shrink-0 rounded-full px-4 py-1.5 text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            پاک کردن همه
          </button>
        </div>

        {showClearConfirm && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-center justify-between">
            <p className="text-sm text-red-400">آیا از پاک کردن همه سفارشات مطمئنید؟</p>
            <div className="flex gap-2">
              <button
                onClick={() => { clearAllOrders(); setShowClearConfirm(false); }}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white"
              >
                بله، پاک کن
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg bg-[#1e1e1e] px-3 py-1.5 text-xs font-bold text-[#888]"
              >
                لغو
              </button>
            </div>
          </div>
        )}

        {/* Orders list */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">سفارشات — Orders</h2>
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-12 text-center">
              <p className="text-[#555] text-sm">
                {orders.length === 0
                  ? "هنوز سفارشی ثبت نشده. از منو سفارش دهید."
                  : "سفارشی در این دسته‌بندی وجود ندارد."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const info = statusLabels[order.status];
                return (
                  <div
                    key={order.id}
                    className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="font-mono font-bold text-sm text-[#ccc]">#{order.id}</span>
                        <span className="mr-3 text-xs text-[#555]">
                          {order.createdAt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${info.color}`}>
                        {info.fa}
                      </span>
                    </div>

                    <div className="text-xs text-[#888] space-y-1 mb-3">
                      <p>
                        {order.table ? `میز ${order.table}` : "بیرون‌بر"} •{" "}
                        {order.items.length} آیتم •{" "}
                        <span className="text-amber-400 font-bold">{formatPrice(order.total, "fa")}</span>
                      </p>
                      {order.customerName && <p>مشتری: {order.customerName}</p>}
                      {order.notes && <p className="text-[#666] italic">یادداشت: {order.notes}</p>}
                    </div>

                    {/* Order items */}
                    <div className="mb-3 rounded-xl bg-[#0a0a0a] p-3 space-y-1">
                      {order.items.map((item, i) => {
                        const mi = menuItems.find((m) => m.id === item.menuItemId);
                        return (
                          <div key={i} className="flex justify-between text-xs text-[#666]">
                            <span>{mi ? mi.nameFa : item.menuItemId} × {item.quantity}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Status actions */}
                    <div className="flex gap-2">
                      {statusOrder.map((nextStatus) => {
                        const isCurrent = order.status === nextStatus;
                        const isNextAllowed =
                          statusOrder.indexOf(nextStatus) === statusOrder.indexOf(order.status) + 1 ||
                          (statusOrder.indexOf(nextStatus) === statusOrder.indexOf(order.status) - 1);
                        if (isCurrent) return null;
                        if (!isNextAllowed) return null;
                        const nextInfo = statusLabels[nextStatus];
                        return (
                          <button
                            key={nextStatus}
                            onClick={() => handleStatusChange(order.id, nextStatus)}
                            className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
                          >
                            → {nextInfo.fa}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Menu management */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">مدیریت منو — Menu Items ({menuToggle.length})</h2>
          <div className="overflow-x-auto rounded-2xl border border-[#1e1e1e]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e] text-left text-xs text-[#666] uppercase tracking-wider">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-center">Available</th>
                  <th className="px-4 py-3 text-center">Bestseller</th>
                  <th className="px-4 py-3 text-center">New</th>
                </tr>
              </thead>
              <tbody>
                {menuToggle.map((item) => {
                  const cat = categories.find((c) => c.slug === item.categorySlug);
                  return (
                    <tr key={item.id} className="border-b border-[#141414] hover:bg-[#141414] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-[#1a1a1a] shrink-0">
                            <img src={item.image} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-[#ccc]">{item.nameEn}</p>
                            <p className="text-xs text-[#666]">{item.nameFa}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#888]">{cat?.nameEn || item.categorySlug}</td>
                      <td className="px-4 py-3 text-right text-amber-400 font-medium tabular-nums">
                        {formatPrice(item.basePrice, "en")}
                      </td>
                      {(["available", "isBestseller", "isNew"] as const).map((field) => (
                        <td key={field} className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleField(item.id, field)}
                            className={`h-6 w-11 rounded-full transition-colors relative ${
                              item[field] ? "bg-amber-500" : "bg-[#333]"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                                item[field] ? "left-[22px]" : "left-0.5"
                              }`}
                            />
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Table Management */}
        <section>
          <h2 className="text-lg font-bold mb-4">مدیریت میزها — Table Management</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((num) => {
              const activeOrdersOnTable = orders.filter(
                (o) => o.table === num && o.status !== "completed"
              );
              const isActive = activeOrdersOnTable.length > 0;
              return (
                <div
                  key={num}
                  className={`rounded-xl border p-3 text-center text-sm font-bold ${
                    isActive
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-[#141414] border-[#1e1e1e] text-[#555]"
                  }`}
                >
                  {num}
                  <p className="text-[10px] font-normal mt-0.5">
                    {isActive ? `${activeOrdersOnTable.length} سفارش` : "خالی"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
