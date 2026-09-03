"use client";

import { useState } from "react";
import { menuItems, categories } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

const mockOrders = [
  { id: "A1B2C3", table: "07", status: "preparing", total: 878000, items: 3, time: "12:34" },
  { id: "D4E5F6", table: "12", status: "ready", total: 449000, items: 1, time: "12:28" },
  { id: "G7H8I9", table: undefined, status: "completed", total: 1157000, items: 5, time: "12:15" },
  { id: "J1K2L3", table: "03", status: "received", total: 568000, items: 2, time: "12:41" },
];

const statusColors: Record<string, string> = {
  received: "bg-blue-500/15 text-blue-400",
  preparing: "bg-amber-500/15 text-amber-400",
  ready: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-[#222] text-[#666]",
};

export default function AdminPage() {
  const [items, setItems] = useState(
    menuItems.map((item) => ({ ...item }))
  );

  const toggleField = (id: string, field: "available" | "isBestseller" | "isNew") => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#faf5e4] p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl font-black tracking-tight mb-1">Demo Admin Interface</h1>
            <p className="text-sm text-[#888]">This is a demo admin panel with mock data.</p>
          </div>

          {/* Menu Items Table */}
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4">Menu Items ({items.length})</h2>
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
                  {items.map((item) => {
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
                              <p className="text-xs text-[#666]" style={{ fontFamily: "Vazirmatn" }}>{item.nameFa}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#888]">{cat?.nameEn || item.categorySlug}</td>
                        <td className="px-4 py-3 text-right text-amber-400 font-medium tabular-nums">
                          {formatPrice(item.basePrice, "en")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleField(item.id, "available")}
                            className={`h-6 w-11 rounded-full transition-colors relative ${
                              item.available ? "bg-amber-500" : "bg-[#333]"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                                item.available ? "left-[22px]" : "left-0.5"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleField(item.id, "isBestseller")}
                            className={`h-6 w-11 rounded-full transition-colors relative ${
                              item.isBestseller ? "bg-amber-500" : "bg-[#333]"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                                item.isBestseller ? "left-[22px]" : "left-0.5"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleField(item.id, "isNew")}
                            className={`h-6 w-11 rounded-full transition-colors relative ${
                              item.isNew ? "bg-amber-500" : "bg-[#333]"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                                item.isNew ? "left-[22px]" : "left-0.5"
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Orders */}
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {mockOrders.map((order) => (
                <div key={order.id} className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm text-[#ccc]">{order.id}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#888] space-y-1">
                    <p>{order.table ? `Table ${order.table}` : "Takeaway"}</p>
                    <p>{order.items} items • {order.time}</p>
                    <p className="text-amber-400 font-bold">{formatPrice(order.total, "en")}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Table Management */}
          <section>
            <h2 className="text-lg font-bold mb-4">Table Management</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
              {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((num) => {
                const occupied = ["03", "07", "12"].includes(num);
                return (
                  <div
                    key={num}
                    className={`rounded-xl border p-3 text-center text-sm font-bold ${
                      occupied
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-[#141414] border-[#1e1e1e] text-[#555]"
                    }`}
                  >
                    {num}
                    <p className="text-[10px] font-normal mt-0.5">
                      {occupied ? "Occupied" : "Empty"}
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
