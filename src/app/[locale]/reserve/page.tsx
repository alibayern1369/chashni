"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import type { Locale } from "@/lib/types";

export default function ReservePage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [form, setForm] = useState({
    guest_name: "",
    guest_phone: "",
    party_size: "2",
    reserved_at: "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setMsg(null);
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
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data?.error || "Failed");
      return;
    }
    setMsg(isRtl ? "رزرو ثبت شد" : "Reservation submitted");
    setForm({ guest_name: "", guest_phone: "", party_size: "2", reserved_at: "" });
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="flex items-center gap-2 text-2xl font-black text-[#faf5e4]">
          <CalendarDays className="text-amber-400" />
          {isRtl ? "رزرو میز" : "Reserve a table"}
        </h1>
        <div className="space-y-3 rounded-2xl border border-[#1e1e1e] bg-[#141414] p-5">
          <input
            value={form.guest_name}
            onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
            placeholder={isRtl ? "نام" : "Name"}
            className="w-full rounded-xl border border-[#333] bg-[#0a0a0a] px-4 py-3 text-sm text-[#ccc]"
          />
          <input
            value={form.guest_phone}
            onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
            placeholder={isRtl ? "تلفن" : "Phone"}
            className="w-full rounded-xl border border-[#333] bg-[#0a0a0a] px-4 py-3 text-sm text-[#ccc]"
            dir="ltr"
          />
          <input
            type="number"
            value={form.party_size}
            onChange={(e) => setForm({ ...form, party_size: e.target.value })}
            placeholder={isRtl ? "تعداد" : "Party size"}
            className="w-full rounded-xl border border-[#333] bg-[#0a0a0a] px-4 py-3 text-sm text-[#ccc]"
          />
          <input
            type="datetime-local"
            value={form.reserved_at}
            onChange={(e) => setForm({ ...form, reserved_at: e.target.value })}
            className="w-full rounded-xl border border-[#333] bg-[#0a0a0a] px-4 py-3 text-sm text-[#ccc]"
            dir="ltr"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          {msg && <p className="text-sm text-emerald-400">{msg}</p>}
          <button
            disabled={busy || !form.guest_name || !form.reserved_at}
            onClick={submit}
            className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-black disabled:opacity-40"
          >
            {isRtl ? "ثبت درخواست" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
