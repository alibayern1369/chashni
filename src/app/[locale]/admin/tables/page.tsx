"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, Plus, QrCode, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale, DBTable } from "@/lib/types";

export default function AdminTablesPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [tables, setTables] = useState<DBTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showQr, setShowQr] = useState<string | null>(null);
  const [form, setForm] = useState({ number: "", name: "", capacity: "4" });

  const loadTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tables");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load tables");
        return;
      }
      setTables(data.tables ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const createTable = async () => {
    const num = parseInt(form.number, 10);
    if (!num) return;
    const res = await fetch("/api/admin/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: num,
        name: form.name || null,
        capacity: parseInt(form.capacity, 10) || 4,
      }),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ number: "", name: "", capacity: "4" });
      loadTables();
    } else {
      const data = await res.json();
      setError(data?.error || "Create failed");
    }
  };

  const toggleActive = async (table: DBTable) => {
    const res = await fetch(`/api/admin/tables/${table.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !table.is_active }),
    });
    if (res.ok) {
      setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, is_active: !t.is_active } : t)));
    }
  };

  const deleteTable = async (id: string) => {
    const res = await fetch(`/api/admin/tables/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTables((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const qrUrl = (table: DBTable) => {
    const base = (
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "")
    ).replace(/\/+$/, "");
    return `${base}/r/chashni/qr/${table.qr_token}`;
  };

  if (loading && tables.length === 0) {
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
          {isRtl ? "مدیریت میزها" : "Tables Management"}
        </h2>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-black hover:bg-amber-400"
        >
          <Plus size={14} />
          {isRtl ? "میز جدید" : "New Table"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showCreate && (
        <div className="rounded-2xl bg-[#141414] border border-[#2a2010] p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#faf5e4]">
            {isRtl ? "ایجاد میز جدید" : "Create New Table"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="number"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
              placeholder={isRtl ? "شماره میز" : "Table number"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={isRtl ? "نام (اختیاری)" : "Name (optional)"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              placeholder={isRtl ? "ظرفیت" : "Capacity"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={createTable}
            disabled={!form.number}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40"
          >
            {isRtl ? "ایجاد میز" : "Create Table"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={cn(
              "rounded-2xl bg-[#141414] border p-5",
              table.is_active ? "border-[#1e1e1e]" : "border-red-500/20 opacity-60",
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-black text-[#faf5e4]">
                  {isRtl ? "میز" : "Table"} {table.number}
                </p>
                {table.name && <p className="text-xs text-[#888]">{table.name}</p>}
                <p className="text-[11px] text-[#666] mt-1">
                  {isRtl ? `ظرفیت ${table.capacity} نفر` : `Capacity ${table.capacity}`}
                </p>
              </div>
              <button
                onClick={() => setShowQr(showQr === table.id ? null : table.id)}
                className="rounded-lg bg-[#1e1e1e] border border-[#333] p-2 text-amber-400 hover:border-amber-500/40"
              >
                <QrCode size={16} />
              </button>
            </div>

            {showQr === table.id && (
              <div className="mt-4 rounded-xl bg-[#1a1a1a] border border-[#2a2010] p-4 text-center">
                <div className="mx-auto h-40 w-40 rounded-lg bg-white p-2 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl(table))}`}
                    alt={`QR Table ${table.number}`}
                    className="h-full w-full"
                  />
                </div>
                <p className="mt-2 text-[10px] text-[#666] break-all" dir="ltr">
                  {qrUrl(table)}
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-[#1e1e1e] pt-3">
              <button
                onClick={() => toggleActive(table)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-bold",
                  table.is_active
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400",
                )}
              >
                {isRtl ? (table.is_active ? "فعال" : "غیرفعال") : table.is_active ? "Active" : "Inactive"}
              </button>
              <button
                onClick={() => deleteTable(table.id)}
                className="rounded-lg p-2 text-[#666] hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-10 text-center text-sm text-[#888]">
          {isRtl ? "میزی ثبت نشده است" : "No tables yet"}
        </div>
      )}
    </div>
  );
}