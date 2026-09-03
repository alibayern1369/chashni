"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Receipt,
  ClipboardList,
  UtensilsCrossed,
  QrCode,
  Settings,
  TrendingUp,
  Timer,
} from "lucide-react";
import { useOrders } from "@/lib/hooks/use-orders";
import { menuItems } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const statusLabels: Record<OrderStatus, string> = {
  received: "Received",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
};

const statusColors: Record<OrderStatus, string> = {
  received: "bg-blue-500/15 text-blue-400",
  preparing: "bg-amber-500/15 text-amber-400",
  ready: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-[#222] text-[#666]",
};

const quickLinks = [
  { href: "/demo/admin/orders", label: "Manage Orders", sub: "Track and update order status", icon: ClipboardList },
  { href: "/demo/admin/menu", label: "Menu Items", sub: "Toggle availability and badges", icon: UtensilsCrossed },
  { href: "/demo/admin/qr", label: "QR Codes", sub: "Download table QR codes", icon: QrCode },
  { href: "/demo/admin/settings", label: "Settings", sub: "Edit restaurant info", icon: Settings },
];

export default function DashboardPage() {
  const orders = useOrders();

  const totalRevenue = useMemo(
    () => orders.reduce((s, o) => s + o.total, 0),
    [orders]
  );
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "completed").length,
    [orders]
  );
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const stats = [
    {
      label: "Total Orders",
      value: orders.length.toString(),
      icon: Receipt,
      accent: "bg-amber-500/15 text-amber-400",
    },
    {
      label: "Active Orders",
      value: activeOrders.toString(),
      icon: Timer,
      accent: "bg-blue-500/15 text-blue-400",
    },
    {
      label: "Revenue",
      value: formatPrice(totalRevenue, "en"),
      icon: TrendingUp,
      accent: "bg-emerald-500/15 text-emerald-400",
    },
    {
      label: "Menu Items",
      value: menuItems.length.toString(),
      icon: UtensilsCrossed,
      accent: "bg-purple-500/15 text-purple-400",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-[#888]">Overview of CHASHNI orders and activity</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-5"
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${stat.accent}`}
            >
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-black tabular-nums">{stat.value}</p>
            <p className="mt-1 text-xs font-semibold text-[#666]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <Link
              href="/demo/admin/orders"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              View all →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-xl bg-[#0a0a0a] p-8 text-center">
              <p className="text-sm text-[#555]">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const names = order.items
                  .map((item) => {
                    if (item.menuItemId === "custom-burger") {
                      return item.customBurger?.name || "Custom Burger";
                    }
                    const mi = menuItems.find((m) => m.id === item.menuItemId);
                    return mi?.nameEn ?? item.menuItemId;
                  })
                  .join(", ");
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[#0a0a0a] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#ccc]">
                          #{order.id}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColors[order.status]}`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-[#666]">
                        {order.table ? `Table ${order.table}` : "Takeaway"} · {names}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-amber-400 tabular-nums">
                        {formatPrice(order.total, "en")}
                      </p>
                      <p className="text-[10px] text-[#555]">({order.items.length} items)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-5">
          <h2 className="mb-4 text-lg font-bold">Quick Actions</h2>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3 transition-colors hover:border-amber-500/40"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e1e1e] text-[#666] transition-colors group-hover:bg-amber-500/15 group-hover:text-amber-400">
                  <link.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#ccc] group-hover:text-[#faf5e4]">
                    {link.label}
                  </p>
                  <p className="text-[11px] text-[#666]">{link.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
