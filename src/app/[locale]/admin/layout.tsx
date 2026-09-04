"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Loader2,
  Receipt,
  UtensilsCrossed,
  LogOut,
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
import {
  DEFAULT_TENANT_SLUG,
  restaurantPath,
  tenantSlugFromPathname,
} from "@/lib/routes";
import type { Locale } from "@/lib/types";

type TabDef = {
  path: string;
  labelFa: string;
  icon: React.ReactNode;
  module?: CatalogModuleId;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params.locale as Locale) || "fa";
  const slug = tenantSlugFromPathname(pathname) || DEFAULT_TENANT_SLUG;
  const { user, loading, signOut } = useAuth();

  const [accessChecked, setAccessChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [modules, setModules] = useState<string[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(restaurantPath("/login", slug));
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
          router.replace(restaurantPath("", slug));
          return;
        }

        const access = await accessRes.json();
        setAllowed(true);
        setRole(access.role ?? null);

        if (restaurantRes.ok) {
          const data = await restaurantRes.json();
          setModules(data.tenant?.enabled_modules ?? []);
        }
      } catch {
        if (mounted) {
          setAllowed(false);
          router.replace(restaurantPath("", slug));
        }
      } finally {
        if (mounted) setAccessChecked(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user, loading, locale, router, slug]);

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
    { path: "/admin/menu", labelFa: "منو", icon: <UtensilsCrossed size={16} />, module: "menu" },
    { path: "/admin", labelFa: "سفارش‌ها", icon: <Receipt size={16} />, module: "orders" },
    { path: "/admin/kitchen", labelFa: "آشپزخانه", icon: <ChefHat size={16} />, module: "orders" },
    { path: "/admin/tables", labelFa: "میزها", icon: <Grid3x3 size={16} />, module: "tables" },
    { path: "/admin/pages", labelFa: "لندینگ رستوران", icon: <LayoutTemplate size={16} />, module: "cms" },
    { path: "/admin/promotions", labelFa: "تخفیف‌ها", icon: <TicketPercent size={16} />, module: "orders" },
    { path: "/admin/media", labelFa: "تصاویر", icon: <ImageIcon size={16} />, module: "menu" },
    { path: "/admin/reservations", labelFa: "رزرو", icon: <CalendarDays size={16} />, module: "reservations" },
    { path: "/admin/settings", labelFa: "تنظیمات", icon: <SettingsIcon size={16} /> },
  ];

  const moduleEnabled = (mod?: CatalogModuleId) => {
    if (!mod) return true;
    if (modules.length === 0) return true;
    return modules.includes(mod);
  };

  const tabs = tabDefs
    .filter((t) => {
      if (!moduleEnabled(t.module ?? ADMIN_NAV_MODULES[t.path])) return false;
      if (isKitchenOnly) return t.path === "/admin" || t.path === "/admin/kitchen";
      return true;
    })
    .map((t) => ({
      ...t,
      href: restaurantPath(t.path, slug),
      active:
        t.path === "/admin"
          ? pathname === restaurantPath("/admin", slug) || pathname.endsWith("/admin")
          : pathname.includes(t.path),
    }));

  const handleSignOut = async () => {
    await signOut();
    router.push(restaurantPath("", slug));
  };

  return (
    <div className="min-h-screen pt-16" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-black text-[#faf5e4]">پنل مدیریت رستوران</h1>
            <p className="text-xs text-[#888]" dir="ltr">
              /r/{slug}/admin
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
