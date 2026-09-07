"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale, TenantMemberRole } from "@/lib/types";

type MemberRow = {
  id: string;
  role: TenantMemberRole;
  is_active: boolean;
  kitchen_can_advance: boolean;
  profiles: {
    id: string;
    email: string | null;
    username: string | null;
    full_name: string | null;
  } | null;
};

const ROLE_OPTS: { value: TenantMemberRole; fa: string; en: string }[] = [
  { value: "admin", fa: "مدیر", en: "Manager" },
  { value: "staff", fa: "فروشنده", en: "Seller / Staff" },
  { value: "kitchen", fa: "آشپز", en: "Kitchen" },
  { value: "owner", fa: "مالک", en: "Owner" },
];

export default function AdminStaffPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    login: "",
    role: "staff" as TenantMemberRole,
    kitchen_can_advance: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/members");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed");
        return;
      }
      setMembers(data.members ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Failed");
      return;
    }
    setShowForm(false);
    setForm({ login: "", role: "staff", kitchen_can_advance: true });
    load();
  };

  const patch = async (id: string, updates: Record<string, unknown>) => {
    const res = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (res.ok) load();
    else {
      const data = await res.json();
      setError(data?.error || "Update failed");
    }
  };

  if (loading && members.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#faf5e4]">
            {isRtl ? "کاربران پنل" : "Staff users"}
          </h2>
          <p className="text-xs text-[#666]">
            {isRtl
              ? "مدیر، فروشنده و آشپز — جدا از سوپرادمین پلتفرم"
              : "Managers, sellers, kitchen — separate from platform super-admin"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-xl border border-[#333] bg-[#1e1e1e] p-2 text-[#ccc]"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-black"
          >
            <Plus size={14} />
            {isRtl ? "افزودن" : "Add"}
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
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            placeholder={isRtl ? "ایمیل یا نام کاربری" : "Email or username"}
            className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4]"
            dir="ltr"
          />
          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as TenantMemberRole })
            }
            className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4]"
          >
            {ROLE_OPTS.map((r) => (
              <option key={r.value} value={r.value}>
                {isRtl ? r.fa : r.en}
              </option>
            ))}
          </select>
          {form.role === "kitchen" && (
            <div className="space-y-2 rounded-xl border border-[#333] bg-[#1a1a1a] p-3">
              <p className="text-xs font-bold text-[#ccc]">
                {isRtl ? "سناریوی آشپز" : "Kitchen scenario"}
              </p>
              <label className="flex items-start gap-2 text-xs text-[#aaa]">
                <input
                  type="radio"
                  className="mt-0.5 accent-amber-500"
                  checked={form.kitchen_can_advance}
                  onChange={() => setForm({ ...form, kitchen_can_advance: true })}
                />
                <span>
                  {isRtl
                    ? "می‌تواند سفارش را دریافت کند و وقتی آماده شد وضعیت را جلو ببرد"
                    : "Can receive orders and advance status when ready"}
                </span>
              </label>
              <label className="flex items-start gap-2 text-xs text-[#aaa]">
                <input
                  type="radio"
                  className="mt-0.5 accent-amber-500"
                  checked={!form.kitchen_can_advance}
                  onChange={() => setForm({ ...form, kitchen_can_advance: false })}
                />
                <span>
                  {isRtl
                    ? "فقط غذاها و فاکتورهای صف آشپزخانه را ببیند (بدون تغییر وضعیت)"
                    : "View-only kitchen queue / invoices (no status changes)"}
                </span>
              </label>
            </div>
          )}
          <button
            onClick={add}
            disabled={!form.login.trim()}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black disabled:opacity-40"
          >
            {isRtl ? "ثبت کاربر" : "Add member"}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {members.map((m) => {
          const label = ROLE_OPTS.find((r) => r.value === m.role);
          return (
            <div
              key={m.id}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border bg-[#141414] p-4 sm:flex-row sm:items-center sm:justify-between",
                m.is_active ? "border-[#1e1e1e]" : "border-red-500/20 opacity-60",
              )}
            >
              <div>
                <p className="font-bold text-[#faf5e4]">
                  {m.profiles?.full_name || m.profiles?.username || m.profiles?.email || "—"}
                </p>
                <p className="text-xs text-[#666]" dir="ltr">
                  {m.profiles?.email || m.profiles?.username}
                </p>
                <p className="mt-1 text-[11px] text-amber-400/90">
                  {label ? (isRtl ? label.fa : label.en) : m.role}
                  {m.role === "kitchen" &&
                    (m.kitchen_can_advance
                      ? isRtl
                        ? " · پیشبرد وضعیت"
                        : " · can advance"
                      : isRtl
                        ? " · فقط مشاهده"
                        : " · view only")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={m.role}
                  onChange={(e) => patch(m.id, { role: e.target.value })}
                  className="rounded-lg border border-[#333] bg-[#1a1a1a] px-2 py-1.5 text-xs text-[#ccc]"
                >
                  {ROLE_OPTS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {isRtl ? r.fa : r.en}
                    </option>
                  ))}
                </select>
                {m.role === "kitchen" && (
                  <select
                    value={m.kitchen_can_advance ? "1" : "0"}
                    onChange={(e) =>
                      patch(m.id, { kitchen_can_advance: e.target.value === "1" })
                    }
                    className="rounded-lg border border-[#333] bg-[#1a1a1a] px-2 py-1.5 text-xs text-[#ccc]"
                  >
                    <option value="1">{isRtl ? "پیشبرد وضعیت" : "Can advance"}</option>
                    <option value="0">{isRtl ? "فقط مشاهده" : "View only"}</option>
                  </select>
                )}
                <button
                  onClick={() => patch(m.id, { is_active: !m.is_active })}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11px] font-bold",
                    m.is_active
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400",
                  )}
                >
                  {isRtl
                    ? m.is_active
                      ? "فعال"
                      : "غیرفعال"
                    : m.is_active
                      ? "Active"
                      : "Off"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
