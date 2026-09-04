"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, RefreshCw, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function SuperUsersPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/super/profiles");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load users");
        return;
      }
      setProfiles(data.profiles ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const patchProfile = async (id: string, updates: Record<string, unknown>) => {
    setBusyId(id);
    const res = await fetch("/api/super/profiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    setBusyId(null);
    if (res.ok) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
    } else {
      const data = await res.json();
      setError(data?.error || "Update failed");
    }
  };

  const roleLabels: Record<string, { fa: string; en: string; color: string }> = {
    super_admin: { fa: "سوپر ادمین", en: "Super Admin", color: "bg-amber-500/15 text-amber-400" },
    restaurant_admin: { fa: "ادمین رستوران", en: "Restaurant Admin", color: "bg-sky-500/15 text-sky-400" },
    kitchen_staff: { fa: "کادر آشپزخانه", en: "Kitchen", color: "bg-violet-500/15 text-violet-400" },
    customer: { fa: "مشتری", en: "Customer", color: "bg-[#222] text-[#888]" },
  };

  if (loading && profiles.length === 0) {
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
          {isRtl ? "مدیریت کاربران" : "Users Management"}
        </h2>
        <button
          onClick={loadProfiles}
          className="flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#333] px-3 py-2 text-xs text-[#ccc] hover:border-[#444]"
        >
          <RefreshCw size={14} />
          {isRtl ? "به‌روزرسانی" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-[#666] border-b border-[#1e1e1e]">
              <th className="px-3 py-3">{isRtl ? "کاربر" : "User"}</th>
              <th className="px-3 py-3 hidden md:table-cell">{isRtl ? "نقش" : "Role"}</th>
              <th className="px-3 py-3">{isRtl ? "وضعیت" : "Status"}</th>
              <th className="px-3 py-3">{isRtl ? "عملیات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => {
              const role = roleLabels[profile.role] ?? roleLabels.customer;
              return (
                <tr key={profile.id} className="border-b border-[#141414] hover:bg-[#0f0f0f]">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                        {profile.role === "super_admin" ? (
                          <Shield size={16} className="text-amber-400" />
                        ) : (
                          <User size={16} className="text-[#666]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#faf5e4] truncate">
                          {profile.full_name || profile.email || profile.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-[#666] truncate" dir="ltr">{profile.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell">
                    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", role.color)}>
                      {isRtl ? role.fa : role.en}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => patchProfile(profile.id, { is_active: !profile.is_active })}
                      disabled={busyId === profile.id}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold",
                        profile.is_active
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400",
                      )}
                    >
                      {isRtl ? (profile.is_active ? "فعال" : "غیرفعال") : profile.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={profile.role}
                      onChange={(e) => patchProfile(profile.id, { role: e.target.value })}
                      disabled={profile.id === busyId}
                      className="rounded-lg bg-[#1a1a1a] border border-[#333] px-2 py-1.5 text-xs text-[#faf5e4] outline-none focus:border-amber-500/50 disabled:opacity-50"
                    >
                      <option value="customer">{isRtl ? "مشتری" : "Customer"}</option>
                      <option value="restaurant_admin">{isRtl ? "ادمین رستوران" : "Restaurant Admin"}</option>
                      <option value="kitchen_staff">{isRtl ? "کادر آشپزخانه" : "Kitchen"}</option>
                      <option value="super_admin">{isRtl ? "سوپر ادمین" : "Super Admin"}</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}