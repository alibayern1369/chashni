"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LayoutDashboard, Store, Users, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";
import { displayLogin } from "@/lib/auth/identity";
import type { Locale } from "@/lib/types";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params.locale as Locale) || "fa";
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (!user) {
    router.replace(`/fa/login`);
    return null;
  }

  const tabs = [
    {
      href: `/fa/admin/super`,
      labelFa: "داشبورد",
      icon: <LayoutDashboard size={16} />,
      active: pathname === `/${locale}/admin/super` || pathname === `/fa/admin/super`,
    },
    {
      href: `/fa/admin/super/tenants`,
      labelFa: "رستوران‌ها",
      icon: <Store size={16} />,
      active: pathname.includes("/admin/super/tenants"),
    },
    {
      href: `/fa/admin/super/users`,
      labelFa: "کاربران",
      icon: <Users size={16} />,
      active: pathname.includes("/admin/super/users"),
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push(`/fa`);
  };

  const loginLabel = displayLogin(
    user.email,
    (user.user_metadata as { username?: string } | undefined)?.username,
  );

  return (
    <div className="min-h-screen pt-16" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-[#faf5e4]">
              <Shield size={22} className="text-amber-400" />
              پنل مدیریت کل (سوپر ادمین)
            </h1>
            <p className="text-xs text-[#888]" dir="ltr">
              {loginLabel}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 self-start rounded-xl border border-[#333] bg-[#1e1e1e] px-4 py-2.5 text-xs font-medium text-[#ccc] hover:border-red-500/40 hover:text-red-400"
          >
            <LogOut size={14} />
            خروج
          </button>
        </div>

        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[#1e1e1e]">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors -mb-px",
                tab.active
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-[#888] hover:text-[#ccc]",
              )}
            >
              {tab.icon}
              {tab.labelFa}
            </Link>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
