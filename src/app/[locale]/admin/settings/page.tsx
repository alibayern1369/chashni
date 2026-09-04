"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Save, Check } from "lucide-react";
import type { Locale, Tenant } from "@/lib/types";

interface TenantSettingsRow {
  key: string;
  value: Record<string, unknown>;
}

export default function AdminSettingsPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [merchantId, setMerchantId] = useState("");
  const [modules, setModules] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load settings");
        return;
      }
      setTenant(data.tenant);
      setModules(data.tenant?.enabled_modules ?? []);
      const kv: Record<string, unknown> = {};
      for (const row of data.settings as TenantSettingsRow[]) {
        kv[row.key] = row.value;
      }
      setSettings(kv);
      const payment = (kv.payment ?? {}) as Record<string, string>;
      setMerchantId(payment.zarinpal_merchant_id || "");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const field = (key: keyof Tenant, fallback = "") => {
    if (!tenant) return fallback;
    const v = tenant[key];
    return v == null ? fallback : String(v);
  };

  const updateTenantField = (key: string, value: string) => {
    if (!tenant) return;
    setTenant({ ...tenant, [key]: value } as Tenant);
  };

  const save = async () => {
    if (!tenant) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name_fa: tenant.name_fa,
        name_en: tenant.name_en,
        slogan_fa: tenant.slogan_fa,
        slogan_en: tenant.slogan_en,
        phone: tenant.phone,
        address_fa: tenant.address_fa,
        address_en: tenant.address_en,
        logo_url: tenant.logo_url,
        primary_color: tenant.primary_color,
        currency: tenant.currency,
        timezone: tenant.timezone,
        settings: {
          payment: {
            ...(typeof settings.payment === "object" && settings.payment
              ? (settings.payment as object)
              : {}),
            zarinpal_merchant_id: merchantId.trim(),
            provider: "zarinpal",
          },
        },
      }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      if (data.tenant) setTenant(data.tenant);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } else {
      const data = await res.json();
      setError(data?.error || "Save failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (error && !tenant) {
    return (
      <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#faf5e4]">
          {isRtl ? "تنظیمات رستوران" : "Restaurant Settings"}
        </h2>
        <span className="rounded-full bg-[#1e1e1e] border border-[#333] px-3 py-1 text-[11px] text-[#888]">
          {isRtl ? "فقط مالک/ادمین" : "Owner/Admin only"}
        </span>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#666]">
          {isRtl ? "اطلاعات پایه" : "Basic Info"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "نام (فارسی)" : "Name (FA)"}</label>
            <input
              value={field("name_fa")}
              onChange={(e) => updateTenantField("name_fa", e.target.value)}
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "نام (انگلیسی)" : "Name (EN)"}</label>
            <input
              value={field("name_en")}
              onChange={(e) => updateTenantField("name_en", e.target.value)}
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "شعار (فارسی)" : "Slogan (FA)"}</label>
            <input
              value={field("slogan_fa")}
              onChange={(e) => updateTenantField("slogan_fa", e.target.value)}
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "شعار (انگلیسی)" : "Slogan (EN)"}</label>
            <input
              value={field("slogan_en")}
              onChange={(e) => updateTenantField("slogan_en", e.target.value)}
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "تلفن" : "Phone"}</label>
            <input
              value={field("phone")}
              onChange={(e) => updateTenantField("phone", e.target.value)}
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "آدرس (فارسی)" : "Address (FA)"}</label>
            <input
              value={field("address_fa")}
              onChange={(e) => updateTenantField("address_fa", e.target.value)}
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "آدرس (انگلیسی)" : "Address (EN)"}</label>
            <input
              value={field("address_en")}
              onChange={(e) => updateTenantField("address_en", e.target.value)}
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#666]">
          {isRtl ? "ظاهر و برند" : "Branding"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "لوگو (URL)" : "Logo (URL)"}</label>
            <input
              value={field("logo_url")}
              onChange={(e) => updateTenantField("logo_url", e.target.value)}
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "رنگ اصلی" : "Primary color"}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={field("primary_color", "#f59e0b")}
                onChange={(e) => updateTenantField("primary_color", e.target.value)}
                className="h-11 w-14 rounded-lg bg-[#1a1a1a] border border-[#333]"
              />
              <input
                value={field("primary_color", "#f59e0b")}
                onChange={(e) => updateTenantField("primary_color", e.target.value)}
                className="flex-1 rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "واحد پول" : "Currency"}</label>
            <input
              value={field("currency")}
              onChange={(e) => updateTenantField("currency", e.target.value)}
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "منطقه زمانی" : "Timezone"}</label>
            <input
              value={field("timezone")}
              onChange={(e) => updateTenantField("timezone", e.target.value)}
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {modules.includes("payment") && (
        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#666]">
            {isRtl ? "پرداخت زرین‌پال" : "Zarinpal Payment"}
          </h3>
          <p className="text-[11px] text-[#666]">
            {isRtl
              ? "Merchant ID درگاه را وارد کنید. ماژول payment باید در سوپرادمین روشن باشد."
              : "Enter your Zarinpal merchant ID. The payment module must be enabled in super admin."}
          </p>
          <input
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            dir="ltr"
          />
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-60"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
        {isRtl ? (saved ? "ذخیره شد" : "ذخیره تغییرات") : saved ? "Saved" : "Save changes"}
      </button>
    </div>
  );
}