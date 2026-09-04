"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale, Promotion } from "@/lib/types";

export default function AdminPromotionsPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order: "0",
    max_uses: "",
    description_fa: "",
    description_en: "",
  });

  const loadPromos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/promotions");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load promotions");
        return;
      }
      setPromos(data.promotions ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  const createPromo = async () => {
    if (!form.code || !form.discount_value) return;
    const res = await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        discount_type: form.discount_type,
        discount_value: parseInt(form.discount_value, 10) || 0,
        min_order: parseInt(form.min_order, 10) || 0,
        max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
        description_fa: form.description_fa || undefined,
        description_en: form.description_en || undefined,
      }),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ code: "", discount_type: "percentage", discount_value: "", min_order: "0", max_uses: "", description_fa: "", description_en: "" });
      loadPromos();
    } else {
      const data = await res.json();
      setError(data?.error || "Create failed");
    }
  };

  const toggleActive = async (promo: Promotion) => {
    const res = await fetch(`/api/admin/promotions/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !promo.is_active }),
    });
    if (res.ok) {
      setPromos((prev) => prev.map((p) => (p.id === promo.id ? { ...p, is_active: !p.is_active } : p)));
    }
  };

  const deletePromo = async (id: string) => {
    const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPromos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  if (loading && promos.length === 0) {
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
          {isRtl ? "کدهای تخفیف" : "Promotions"}
        </h2>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-black hover:bg-amber-400"
        >
          <Plus size={14} />
          {isRtl ? "کد جدید" : "New Code"}
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
            {isRtl ? "ایجاد کد تخفیف" : "Create Promotion"}{" "}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder={isRtl ? "کد (مثلاً OFF10)" : "Code (e.g. OFF10)"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            >
              <option value="percentage">{isRtl ? "درصدی" : "Percent"}</option>
              <option value="fixed">{isRtl ? "مبلغ ثابت" : "Fixed"}</option>
            </select>
            <input
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
              placeholder={isRtl ? "مقدار تخفیف" : "Discount value"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
            <input
              value={form.min_order}
              onChange={(e) => setForm({ ...form, min_order: e.target.value })}
              placeholder={isRtl ? "حداقل مبلغ سفارش" : "Minimum order"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
            <input
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              placeholder={isRtl ? "حداکثر استفاده (اختیاری)" : "Max uses (optional)"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
            <input
              value={form.description_fa}
              onChange={(e) => setForm({ ...form, description_fa: e.target.value })}
              placeholder={isRtl ? "توضیح فارسی" : "Persian description"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
            <input
              value={form.description_en}
              onChange={(e) => setForm({ ...form, description_en: e.target.value })}
              placeholder={isRtl ? "توضیح انگلیسی" : "English description"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={createPromo}
            disabled={!form.code || !form.discount_value}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40"
          >
            {isRtl ? "ایجاد کد" : "Create Code"}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#141414] border p-4",
              promo.is_active ? "border-[#1e1e1e]" : "border-red-500/20 opacity-60",
            )}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-sm font-black tracking-wider text-amber-400">
                  {promo.code}
                </span>
                <span className="text-sm font-bold text-[#faf5e4]">
                  {promo.discount_type === "percentage"
                    ? `${promo.discount_value}%`
                    : `-${promo.discount_value.toLocaleString()} تومان`}
                </span>
              </div>
              {(promo.description_fa || promo.description_en) && (
                <p className="mt-1 text-xs text-[#888]">
                  {isRtl ? promo.description_fa : promo.description_en}
                </p>
              )}
              <p className="mt-0.5 text-[10px] text-[#666]">
                {isRtl
                  ? `حداقل سفارش ${promo.min_order.toLocaleString()}`
                  : `Min order ${promo.min_order.toLocaleString()}`}
                {promo.max_uses ? ` • ${isRtl ? `محدودیت: ${promo.max_uses}` : `Limit ${promo.max_uses}`}` : ""}
                {isRtl ? ` • استفاده: ${promo.used_count}` : ` • Used: ${promo.used_count}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActive(promo)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-bold",
                  promo.is_active
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400",
                )}
              >
                {isRtl ? (promo.is_active ? "فعال" : "غیرفعال") : promo.is_active ? "Active" : "Inactive"}
              </button>
              <button
                onClick={() => deletePromo(promo.id)}
                className="rounded-lg p-2 text-[#666] hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {promos.length === 0 && (
        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-10 text-center text-sm text-[#888]">
          {isRtl ? "کد تخفیفی ثبت نشده است" : "No promotions yet"}
        </div>
      )}
    </div>
  );
}