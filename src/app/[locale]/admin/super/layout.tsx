"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LayoutDashboard, Store, Users, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { user, loading, signOut } = useAuth();

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

  const tabs = [
    {
      href: `/${locale}/admin/super`,
      labelFa: "داشبورد",
      labelEn: "Dashboard",
      icon: <LayoutDashboard size={16} />,
      active: pathname === `/${locale}/admin/super`,
    },
    {
      href: `/${locale}/admin/super/tenants`,
      labelFa: "تننت‌ها",
      labelEn: "Tenants",
      icon: <Store size={16} />,
      active: pathname.includes("/admin/super/tenants"),
    },
    {
      href: `/${locale}/admin/super/users`,
      labelFa: "کاربران",
      labelEn: "Users",
      icon: <Users size={16} />,
      active: pathname.includes("/admin/super/users"),
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-[#faf5e4]">
              <Shield size={22} className="text-amber-400" />
              {isRtl ? "پنل مدیریت کل (سوپر ادمین)" : "Super Admin"}
            </h1>
            <p className="text-xs text-[#888]" dir="ltr">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="self-start flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#333] px-4 py-2.5 text-xs font-medium text-[#ccc] hover:border-red-500/40 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            {isRtl ? "خروج" : "Sign out"}
          </button>
        </div>

        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[#1e1e1e]">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px shrink-0",
                tab.active
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-[#888] hover:text-[#ccc]",
              )}
            >
              {tab.icon}
              {isRtl ? tab.labelFa : tab.labelEn}
            </Link>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}