"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  ChefHat,
  UtensilsCrossed,
  Grid3x3,
  Image as ImageIcon,
  TicketPercent,
  CalendarDays,
  LayoutTemplate,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";
import type { CatalogModuleId } from "@/lib/modules/catalog";
import {
  DEFAULT_TENANT_SLUG,
  restaurantPath,
  restaurantRestPath,
  tenantSlugFromPathname,
} from "@/lib/routes";
import type { Locale } from "@/lib/types";

type NavItem = {
  path: string;
  labelFa: string;
  labelEn: string;
  icon: React.ReactNode;
  module?: CatalogModuleId;
  kitchenAllowed?: boolean;
  manageOnly?: boolean;
};

const ROLE_LABEL: Record<string, { fa: string; en: string }> = {
  owner: { fa: "مالک", en: "Owner" },
  admin: { fa: "مدیر", en: "Manager" },
  staff: { fa: "فروشنده", en: "Staff" },
  kitchen: { fa: "آشپز", en: "Kitchen" },
  super_admin: { fa: "سوپر ادمین", en: "Super admin" },
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const slug = tenantSlugFromPathname(pathname) || DEFAULT_TENANT_SLUG;
  const { user, loading, signOut } = useAuth();

  const [accessChecked, setAccessChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [kitchenCanAdvance, setKitchenCanAdvance] = useState(true);
  const [modules, setModules] = useState<string[] | null>(null);
  const [tenantName, setTenantName] = useState("نمکدان");
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        setKitchenCanAdvance(access.kitchenCanAdvance !== false);
        if (access.tenantNameFa || access.tenantNameEn) {
          setTenantName(isRtl ? access.tenantNameFa || access.tenantNameEn : access.tenantNameEn || access.tenantNameFa);
        }

        if (restaurantRes.ok) {
          const data = await restaurantRes.json();
          setModules(data.tenant?.enabled_modules ?? []);
          if (data.tenant) {
            setTenantName(
              isRtl ? data.tenant.name_fa || data.tenant.name_en : data.tenant.name_en || data.tenant.name_fa,
            );
          }
        } else {
          setModules([]);
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
  }, [user, loading, router, slug, isRtl]);

  const restPath = restaurantRestPath(pathname);
  const isKitchenOnly = role === "kitchen";
  const canManage = role === "owner" || role === "admin" || role === "super_admin";

  useEffect(() => {
    if (!accessChecked || !allowed || !isKitchenOnly) return;
    const ok =
      restPath === "/admin/kitchen" ||
      restPath.startsWith("/admin/kitchen/") ||
      restPath === "/admin/orders" ||
      restPath.startsWith("/admin/orders/");
    if (!ok) {
      router.replace(restaurantPath("/admin/kitchen", slug));
    }
  }, [accessChecked, allowed, isKitchenOnly, restPath, router, slug]);

  const navDefs: NavItem[] = useMemo(
    () => [
      { path: "/admin", labelFa: "خانه", labelEn: "Home", icon: <LayoutDashboard size={18} /> },
      {
        path: "/admin/orders",
        labelFa: "سفارش‌ها",
        labelEn: "Orders",
        icon: <Receipt size={18} />,
        module: "orders",
        kitchenAllowed: true,
      },
      {
        path: "/admin/kitchen",
        labelFa: "آشپزخانه",
        labelEn: "Kitchen",
        icon: <ChefHat size={18} />,
        module: "orders",
        kitchenAllowed: true,
      },
      { path: "/admin/menu", labelFa: "منو", labelEn: "Menu", icon: <UtensilsCrossed size={18} />, module: "menu" },
      { path: "/admin/tables", labelFa: "میزها", labelEn: "Tables", icon: <Grid3x3 size={18} />, module: "tables" },
      { path: "/admin/media", labelFa: "تصاویر", labelEn: "Media", icon: <ImageIcon size={18} />, module: "menu" },
      {
        path: "/admin/promotions",
        labelFa: "تخفیف‌ها",
        labelEn: "Promos",
        icon: <TicketPercent size={18} />,
        module: "orders",
      },
      {
        path: "/admin/reservations",
        labelFa: "رزرو",
        labelEn: "Reservations",
        icon: <CalendarDays size={18} />,
        module: "reservations",
      },
      {
        path: "/admin/pages",
        labelFa: "لندینگ",
        labelEn: "Landing",
        icon: <LayoutTemplate size={18} />,
        module: "cms",
      },
      { path: "/admin/reports", labelFa: "گزارش‌ها", labelEn: "Reports", icon: <BarChart3 size={18} />, module: "orders" },
      {
        path: "/admin/staff",
        labelFa: "کاربران",
        labelEn: "Staff",
        icon: <Users size={18} />,
        manageOnly: true,
      },
      { path: "/admin/settings", labelFa: "تنظیمات", labelEn: "Settings", icon: <Settings size={18} /> },
    ],
    [],
  );

  if (loading || !accessChecked || modules === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (!user || !allowed) return null;

  const moduleEnabled = (mod?: CatalogModuleId) => {
    if (!mod) return true;
    return modules.includes(mod);
  };

  const tabs = navDefs
    .filter((t) => {
      if (t.manageOnly && !canManage) return false;
      if (!moduleEnabled(t.module)) return false;
      if (isKitchenOnly) return Boolean(t.kitchenAllowed);
      return true;
    })
    .map((t) => ({
      ...t,
      href: restaurantPath(t.path, slug),
      active:
        t.path === "/admin"
          ? restPath === "/admin" || restPath === "/admin/"
          : restPath === t.path || restPath.startsWith(t.path + "/"),
    }));

  const handleSignOut = async () => {
    await signOut();
    router.push(restaurantPath("", slug));
  };

  const roleLabel = role ? ROLE_LABEL[role] : null;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#1e1e1e] px-5 py-5">
        <p className="text-sm font-black text-[#faf5e4]">{tenantName}</p>
        <p className="mt-0.5 text-[11px] text-[#666]">
          {isRtl ? "پنل مدیریت رستوران" : "Restaurant admin"}
          {roleLabel ? ` · ${isRtl ? roleLabel.fa : roleLabel.en}` : ""}
        </p>
        <button
          type="button"
          className="mt-3 rounded-lg p-1.5 text-[#888] hover:bg-[#1e1e1e] lg:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={() => setDrawerOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              tab.active
                ? "bg-amber-500/15 text-amber-400"
                : "text-[#888] hover:bg-[#1e1e1e] hover:text-[#ccc]",
            )}
          >
            {tab.icon}
            {isRtl ? tab.labelFa : tab.labelEn}
          </Link>
        ))}
      </nav>

      <div className="border-t border-[#1e1e1e] p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#888] hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          {isRtl ? "خروج" : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#faf5e4]" dir={isRtl ? "rtl" : "ltr"}>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#1e1e1e] bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-[#faf5e4] hover:bg-[#1e1e1e]"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-sm font-bold">{tenantName}</p>
            <p className="text-[10px] text-[#666]">
              {roleLabel ? (isRtl ? roleLabel.fa : roleLabel.en) : ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-xs text-[#ccc] hover:border-red-500/40 hover:text-red-400"
        >
          <LogOut size={14} />
          {isRtl ? "خروج" : "Out"}
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed top-0 z-30 hidden h-full w-64 border-[#1e1e1e] bg-[#111] lg:block",
          isRtl ? "right-0 border-l" : "left-0 border-r",
        )}
      >
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className={cn(
              "fixed top-0 z-50 h-full w-72 bg-[#111] shadow-2xl lg:hidden",
              isRtl ? "right-0" : "left-0",
            )}
          >
            {sidebar}
          </aside>
        </>
      )}

      {/* Desktop header strip */}
      <div
        className={cn(
          "sticky top-0 z-20 hidden items-center justify-between border-b border-[#1e1e1e] bg-[#0a0a0a]/95 px-6 py-3 backdrop-blur lg:flex",
          isRtl ? "lg:mr-64" : "lg:ml-64",
        )}
      >
        <div>
          <p className="text-sm font-bold text-[#faf5e4]">
            {isRtl ? "پنل مدیریت رستوران" : "Restaurant Admin"}
          </p>
          <p className="text-[11px] text-[#666]" dir="ltr">
            /r/{slug}/admin
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#141414] px-4 py-2 text-xs font-medium text-[#ccc] hover:border-red-500/40 hover:text-red-400"
        >
          <LogOut size={14} />
          {isRtl ? "خروج" : "Sign out"}
        </button>
      </div>

      <main className={cn("min-h-screen px-4 py-6 lg:px-8", isRtl ? "lg:mr-64" : "lg:ml-64")}>
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Expose kitchen flag for child pages via data attribute */}
      <span className="hidden" data-kitchen-can-advance={kitchenCanAdvance ? "1" : "0"} />
    </div>
  );
}

/** Hook-friendly export for kitchen permission from access API cache would be better;
 * children should re-fetch /api/admin/access when needed. */
export type { NavItem };
