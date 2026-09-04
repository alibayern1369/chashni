"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, RefreshCw, Plus, Pencil, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODULE_CATALOG } from "@/lib/modules/catalog";
import type { Locale, Tenant } from "@/lib/types";

export default function SuperTenantsPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name_fa: "",
    name_en: "",
    slug: "",
  });

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/super/tenants");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load tenants");
        return;
      }
      setTenants(data.tenants ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const patchTenant = async (id: string, updates: Record<string, unknown>) => {
    setBusyId(id);
    const res = await fetch("/api/super/tenants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    setBusyId(null);
    if (res.ok) {
      setTenants((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      );
    } else {
      const data = await res.json();
      setError(data?.error || "Update failed");
    }
  };

  const toggleModule = (tenant: Tenant, mod: string) => {
    const enabled = tenant.enabled_modules?.includes(mod) ?? false;
    const next = enabled
      ? (tenant.enabled_modules ?? []).filter((m) => m !== mod)
      : [...(tenant.enabled_modules ?? []), mod];
    patchTenant(tenant.id, { enabled_modules: next });
  };

  const createTenant = async () => {
    if (!form.name_fa || !form.name_en || !form.slug) return;
    const res = await fetch("/api/super/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ name_fa: "", name_en: "", slug: "" });
      loadTenants();
    } else {
      const data = await res.json();
      setError(data?.error || "Create failed");
    }
  };

  if (loading && tenants.length === 0) {
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
          {isRtl ? "مدیریت تننت‌ها" : "Tenants Management"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={loadTenants}
            className="flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#333] px-3 py-2 text-xs text-[#ccc] hover:border-[#444]"
          >
            <RefreshCw size={14} />
            {isRtl ? "به‌روزرسانی" : "Refresh"}
          </button>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-black hover:bg-amber-400"
          >
            <Plus size={14} />
            {isRtl ? "تننت جدید" : "New Tenant"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showCreate && (
        <div className="rounded-2xl bg-[#141414] border border-[#2a2010] p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#faf5e4]">
            {isRtl ? "ایجاد تننت جدید" : "Create New Tenant"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={form.name_fa}
              onChange={(e) => setForm({ ...form, name_fa: e.target.value })}
              placeholder={isRtl ? "نام فارسی" : "Persian name"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
            <input
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              placeholder={isRtl ? "نام انگلیسی" : "English name"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder={isRtl ? "اسلاگ (slug)" : "Slug"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={createTenant}
            disabled={!form.name_fa || !form.name_en || !form.slug}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isRtl ? "ایجاد تننت" : "Create Tenant"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#1a1a1a] flex items-center justify-center font-black text-amber-400">
                  {(tenant.name_en || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#faf5e4] truncate">
                    {tenant.name_en} {isRtl && tenant.name_fa ? `(${tenant.name_fa})` : ""}
                  </p>
                  <p className="text-xs text-[#666] truncate">
                    {tenant.slug} — {tenant.currency}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    patchTenant(tenant.id, { is_active: !tenant.is_active })
                  }
                  disabled={busyId === tenant.id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors",
                    tenant.is_active
                      ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                      : "bg-red-500/15 text-red-400 hover:bg-red-500/25",
                  )}
                >
                  {busyId === tenant.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : tenant.is_active ? (
                    <Check size={12} />
                  ) : (
                    <X size={12} />
                  )}
                  {isRtl ? (tenant.is_active ? "فعال" : "غیرفعال") : tenant.is_active ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => setEditing(editing?.id === tenant.id ? null : tenant)}
                  className="rounded-lg bg-[#1e1e1e] border border-[#333] p-2 text-[#ccc] hover:border-amber-500/30 hover:text-amber-400"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>

            {editing?.id === tenant.id && (
              <div className="mt-4 border-t border-[#1e1e1e] pt-4">
                <p className="mb-2 text-xs font-semibold text-[#888]">
                  {isRtl ? "ماژول‌ها" : "Modules"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {MODULE_CATALOG.map((mod) => {
                    const on = tenant.enabled_modules?.includes(mod.id) ?? false;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => toggleModule(tenant, mod.id)}
                        disabled={busyId === tenant.id}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-[11px] font-semibold border transition-colors",
                          on
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                            : "bg-transparent border-[#2a2a2a] text-[#666] hover:border-[#444]",
                        )}
                      >
                        {isRtl ? mod.labelFa : mod.labelEn}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    defaultValue={tenant.name_fa}
                    onBlur={(e) => e.target.value !== tenant.name_fa && patchTenant(tenant.id, { name_fa: e.target.value })}
                    placeholder={isRtl ? "نام فارسی" : "Persian name"}
                    className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2 text-xs text-[#faf5e4] outline-none focus:border-amber-500/50"
                  />
                  <input
                    defaultValue={tenant.name_en}
                    onBlur={(e) => e.target.value !== tenant.name_en && patchTenant(tenant.id, { name_en: e.target.value })}
                    placeholder={isRtl ? "نام انگلیسی" : "English name"}
                    className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2 text-xs text-[#faf5e4] outline-none focus:border-amber-500/50"
                  />
                  <input
                    defaultValue={tenant.slug}
                    onBlur={(e) => e.target.value !== tenant.slug && patchTenant(tenant.id, { slug: e.target.value })}
                    placeholder="slug"
                    className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2 text-xs text-[#faf5e4] outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}