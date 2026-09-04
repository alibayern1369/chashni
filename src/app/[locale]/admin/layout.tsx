"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Loader2,
  Receipt,
  UtensilsCrossed,
  LogOut,
  Shield,
  ChefHat,
  Grid3x3,
  Settings as SettingsIcon,
  LayoutTemplate,
  TicketPercent,
  Image as ImageIcon,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_MODULES, type CatalogModuleId } from "@/lib/modules/catalog";
import type { Locale } from "@/lib/types";

type TabDef = {
  path: string;
  labelFa: string;
  labelEn: string;
  icon: React.ReactNode;
  module?: CatalogModuleId;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { user, loading, signOut } = useAuth();

  const [accessChecked, setAccessChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [modules, setModules] = useState<string[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/${locale}/login`);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const [accessRes, restaurantRes] = await Promise.all([
          fetch("/api/admin/access"),
          fetch("/api/restaurant"),
        ]);
        if (!mounted) return;

        if (!accessRes.ok) {
          setAllowed(false);
          setAccessChecked(true);
          router.replace(`/${locale}`);
          return;
        }

        const access = await accessRes.json();
        setAllowed(true);
        setSuperAdmin(!!access.isSuperAdmin);
        setRole(access.role ?? null);

        if (restaurantRes.ok) {
          const data = await restaurantRes.json();
          setModules(data.tenant?.enabled_modules ?? []);
        }
      } catch {
        if (mounted) {
          setAllowed(false);
          router.replace(`/${locale}`);
        }
      } finally {
        if (mounted) setAccessChecked(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user, loading, locale, router]);

  if (loading || !accessChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (!user || !allowed) return null;

  const isKitchenOnly = role === "kitchen";

  const tabDefs: TabDef[] = [
    { path: "/admin/menu", labelFa: "منو", labelEn: "Menu", icon: <UtensilsCrossed size={16} />, module: "menu" },
    { path: "/admin", labelFa: "سفارش‌ها", labelEn: "Orders", icon: <Receipt size={16} />, module: "orders" },
    { path: "/admin/kitchen", labelFa: "آشپزخانه", labelEn: "Kitchen", icon: <ChefHat size={16} />, module: "orders" },
    { path: "/admin/tables", labelFa: "میزها", labelEn: "Tables", icon: <Grid3x3 size={16} />, module: "tables" },
    { path: "/admin/pages", labelFa: "لندینگ", labelEn: "Pages", icon: <LayoutTemplate size={16} />, module: "cms" },
    { path: "/admin/promotions", labelFa: "تخفیف‌ها", labelEn: "Promos", icon: <TicketPercent size={16} />, module: "orders" },
    { path: "/admin/media", labelFa: "تصاویر", labelEn: "Media", icon: <ImageIcon size={16} />, module: "menu" },
    { path: "/admin/reservations", labelFa: "رزرو", labelEn: "Reservations", icon: <CalendarDays size={16} />, module: "reservations" },
    { path: "/admin/settings", labelFa: "تنظیمات", labelEn: "Settings", icon: <SettingsIcon size={16} /> },
  ];

  const moduleEnabled = (mod?: CatalogModuleId) => {
    if (!mod) return true;
    if (modules.length === 0) return true;
    return modules.includes(mod);
  };

  const tabs = tabDefs
    .filter((t) => {
      if (!moduleEnabled(t.module ?? ADMIN_NAV_MODULES[t.path])) return false;
      if (isKitchenOnly) {
        return t.path === "/admin" || t.path === "/admin/kitchen";
      }
      return true;
    })
    .map((t) => ({
      ...t,
      href: `/${locale}${t.path}`,
      active:
        t.path === "/admin"
          ? pathname === `/${locale}/admin`
          : pathname.includes(t.path),
    }));

  if (superAdmin) {
    tabs.push({
      path: "/admin/super",
      href: `/${locale}/admin/super`,
      labelFa: "پنل کل",
      labelEn: "Super",
      icon: <Shield size={16} />,
      active: pathname.includes("/admin/super"),
    });
  }

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#faf5e4]">
              {isRtl ? "پنل مدیریت رستوران" : "Restaurant Admin"}
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
