"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, Loader2, Settings, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { restaurantPath, superPath } from "@/lib/routes";
import type { Locale } from "@/lib/types";

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { user, loading, signOut } = useAuth();
  const [loyalty, setLoyalty] = useState<{ enabled: boolean; points: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/loyalty")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setLoyalty(data);
      })
      .catch(() => {});
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (!user) {
    router.replace(`/${locale}/login`);
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  const meta = user.user_metadata as Record<string, string> | undefined;
  const fullName = meta?.full_name;

  return (
    <div className="min-h-screen px-4 py-24">
      <div className="mx-auto max-w-lg">
        <div className="rounded-3xl bg-[#141414] border border-[#1e1e1e] p-6 text-center mb-6">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/25">
            <UserIcon size={32} className="text-amber-400" />
          </div>
          <h1 className="text-xl font-black text-[#faf5e4] mb-1">
            {fullName || (isRtl ? "کاربر چاشنی" : "CHASHNI User")}
          </h1>
          <p className="text-sm text-[#888]" dir="ltr">
            {user.email}
          </p>

          {loyalty?.enabled && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/25 px-4 py-2 text-sm text-amber-400">
              <Sparkles size={14} />
              {isRtl ? `${loyalty.points} امتیاز` : `${loyalty.points} points`}
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#333] px-4 py-3 text-sm font-medium text-[#ccc] hover:border-red-500/40 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            {isRtl ? "خروج از حساب" : "Sign out"}
          </button>
        </div>

        <div className="rounded-3xl bg-[#141414] border border-[#1e1e1e] p-6">
          <h2 className="text-sm font-bold text-[#faf5e4] mb-4">
            {isRtl ? "سفارش‌های من" : "My Orders"}
          </h2>
          <p className="text-sm text-[#888]">
            {isRtl
              ? "تاریخچه و وضعیت سفارش‌هایت را اینجا ببین."
              : "View your order history and statuses here."}
          </p>
          <Link
            href={restaurantPath("/my-orders")}
            className="mt-6 inline-block w-full rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black text-center hover:bg-amber-400"
          >
            {isRtl ? "مشاهده سفارش‌ها" : "View my orders"}
          </Link>
          <Link
            href={restaurantPath("/admin")}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#333] px-5 py-2.5 text-sm font-medium text-[#ccc] hover:border-amber-500/30 hover:text-amber-400 transition-colors"
          >
            <Settings size={16} />
            {isRtl ? "پنل مدیریت رستوران" : "Restaurant Admin"}
          </Link>
          <Link
            href={superPath()}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#333] bg-[#1e1e1e] px-5 py-2.5 text-sm font-medium text-[#ccc] hover:border-amber-500/30 hover:text-amber-400"
          >
            سوپر ادمین
          </Link>
        </div>
      </div>
    </div>
  );
}
