"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface Reservation {
  id: string;
  guest_name: string;
  guest_phone: string | null;
  party_size: number;
  reserved_at: string;
  status: string;
  notes: string | null;
}

export default function AdminReservationsPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [rows, setRows] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    guest_name: "",
    guest_phone: "",
    party_size: "2",
    reserved_at: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed");
        return;
      }
      setRows(data.reservations ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest_name: form.guest_name,
        guest_phone: form.guest_phone || undefined,
        party_size: parseInt(form.party_size, 10) || 2,
        reserved_at: new Date(form.reserved_at).toISOString(),
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ guest_name: "", guest_phone: "", party_size: "2", reserved_at: "" });
      load();
    } else {
      const data = await res.json();
      setError(data?.error || "Create failed");
    }
  };

  const setStatus = async (id: string, status: string) => {
    const res = await fetch("/api/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) load();
  };

  if (loading && rows.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#faf5e4]">
          {isRtl ? "رزرو میز" : "Reservations"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-xl border border-[#333] bg-[#1e1e1e] px-3 py-2 text-xs text-[#ccc]"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-black"
          >
            <Plus size={14} />
            {isRtl ? "رزرو جدید" : "New"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <div className="space-y-3 rounded-2xl border border-[#2a2010] bg-[#141414] p-5">
          <input
            value={form.guest_name}
            onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
            placeholder={isRtl ? "نام مهمان" : "Guest name"}
            className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4]"
          />
          <input
            value={form.guest_phone}
            onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
            placeholder={isRtl ? "تلفن" : "Phone"}
            className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4]"
            dir="ltr"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={form.party_size}
              onChange={(e) => setForm({ ...form, party_size: e.target.value })}
              placeholder={isRtl ? "تعداد نفرات" : "Party size"}
              className="rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4]"
            />
            <input
              type="datetime-local"
              value={form.reserved_at}
              onChange={(e) => setForm({ ...form, reserved_at: e.target.value })}
              className="rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4]"
              dir="ltr"
            />
          </div>
          <button
            onClick={create}
            disabled={!form.guest_name || !form.reserved_at}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black disabled:opacity-40"
          >
            {isRtl ? "ثبت رزرو" : "Create"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-3 rounded-2xl border border-[#1e1e1e] bg-[#141414] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-bold text-[#faf5e4]">{r.guest_name}</p>
              <p className="text-xs text-[#888]">
                {new Date(r.reserved_at).toLocaleString(isRtl ? "fa-IR" : "en-US")} ·{" "}
                {isRtl ? `${r.party_size} نفر` : `${r.party_size} guests`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["pending", "confirmed", "seated", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(r.id, s)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-bold",
                    r.status === s
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-[#1e1e1e] text-[#666]",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-10 text-center text-sm text-[#888]">
            {isRtl ? "رزروی ثبت نشده" : "No reservations"}
          </p>
        )}
      </div>
    </div>
  );
}
