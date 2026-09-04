"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, Shield, User, Plus, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { displayLogin } from "@/lib/auth/identity";

interface ProfileRow {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function SuperUsersPage() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [passwordFor, setPasswordFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "restaurant_admin",
  });

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/super/profiles");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "خطا در بارگذاری کاربران");
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
      const data = await res.json();
      if (data.profile) {
        setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...data.profile } : p)));
      } else {
        setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      }
      if (updates.password) {
        setPasswordFor(null);
        setNewPassword("");
      }
    } else {
      const data = await res.json();
      setError(data?.error || "به‌روزرسانی ناموفق بود");
    }
  };

  const createUser = async () => {
    setError(null);
    const res = await fetch("/api/super/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "ساخت کاربر ناموفق بود");
      return;
    }
    setShowCreate(false);
    setForm({ username: "", password: "", full_name: "", role: "restaurant_admin" });
    loadProfiles();
  };

  const roleLabels: Record<string, { fa: string; color: string }> = {
    super_admin: { fa: "سوپر ادمین", color: "bg-amber-500/15 text-amber-400" },
    restaurant_admin: { fa: "ادمین رستوران", color: "bg-sky-500/15 text-sky-400" },
    kitchen_staff: { fa: "کادر آشپزخانه", color: "bg-violet-500/15 text-violet-400" },
    customer: { fa: "مشتری", color: "bg-[#222] text-[#888]" },
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#faf5e4]">مدیریت کاربران</h2>
        <div className="flex gap-2">
          <button
            onClick={loadProfiles}
            className="flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#333] px-3 py-2 text-xs text-[#ccc]"
          >
            <RefreshCw size={14} />
            به‌روزرسانی
          </button>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-black"
          >
            <Plus size={14} />
            کاربر جدید
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showCreate && (
        <div className="space-y-3 rounded-2xl border border-[#2a2010] bg-[#141414] p-5">
          <h3 className="text-sm font-bold text-[#faf5e4]">ساخت کاربر با نام کاربری و رمز</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="نام کاربری"
              dir="ltr"
              className="rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4]"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="رمز عبور"
              dir="ltr"
              className="rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4]"
            />
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="نام نمایشی (اختیاری)"
              className="rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4]"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4]"
            >
              <option value="restaurant_admin">ادمین رستوران</option>
              <option value="kitchen_staff">کادر آشپزخانه</option>
              <option value="customer">مشتری</option>
              <option value="super_admin">سوپر ادمین</option>
            </select>
          </div>
          <button
            onClick={createUser}
            disabled={!form.username || !form.password}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black disabled:opacity-40"
          >
            ایجاد کاربر
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] text-[10px] uppercase tracking-wider text-[#666]">
              <th className="px-3 py-3 text-right">کاربر</th>
              <th className="hidden px-3 py-3 text-right md:table-cell">نقش</th>
              <th className="px-3 py-3 text-right">وضعیت</th>
              <th className="px-3 py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => {
              const role = roleLabels[profile.role] ?? roleLabels.customer;
              const login = displayLogin(profile.email, profile.username);
              return (
                <tr key={profile.id} className="border-b border-[#141414] hover:bg-[#0f0f0f]">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a]">
                        {profile.role === "super_admin" ? (
                          <Shield size={16} className="text-amber-400" />
                        ) : (
                          <User size={16} className="text-[#666]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#faf5e4]">
                          {profile.full_name || login}
                        </p>
                        <p className="truncate text-xs text-[#666]" dir="ltr">
                          {login}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 md:table-cell">
                    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", role.color)}>
                      {role.fa}
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
                      {profile.is_active ? "فعال" : "غیرفعال"}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={profile.role}
                        onChange={(e) => patchProfile(profile.id, { role: e.target.value })}
                        disabled={profile.id === busyId}
                        className="rounded-lg border border-[#333] bg-[#1a1a1a] px-2 py-1.5 text-xs text-[#faf5e4] outline-none disabled:opacity-50"
                      >
                        <option value="customer">مشتری</option>
                        <option value="restaurant_admin">ادمین رستوران</option>
                        <option value="kitchen_staff">کادر آشپزخانه</option>
                        <option value="super_admin">سوپر ادمین</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordFor(passwordFor === profile.id ? null : profile.id);
                          setNewPassword("");
                        }}
                        className="rounded-lg border border-[#333] bg-[#1e1e1e] p-2 text-amber-400"
                        title="تغییر رمز"
                      >
                        <KeyRound size={14} />
                      </button>
                    </div>
                    {passwordFor === profile.id && (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="رمز جدید"
                          dir="ltr"
                          className="flex-1 rounded-lg border border-[#333] bg-[#0a0a0a] px-2 py-1.5 text-xs text-[#faf5e4]"
                        />
                        <button
                          type="button"
                          disabled={!newPassword || busyId === profile.id}
                          onClick={() => patchProfile(profile.id, { password: newPassword })}
                          className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black disabled:opacity-40"
                        >
                          ذخیره
                        </button>
                      </div>
                    )}
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
