"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  restaurantRestPath,
  tenantSlugFromPathname,
} from "@/lib/routes";
import type { Locale } from "@/lib/types";

type TabDef = {
  path: string;
  labelFa: string;
  labelEn: string;
  icon: React.ReactNode;
  module?: CatalogModuleId;
  kitchenAllowed?: boolean;
};

const KITCHEN_ALLOWED_PATHS = ["/admin", "/admin/kitchen"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
  const [modules, setModules] = useState<string[] | null>(null);

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
  }, [user, loading, router, slug]);

  const restPath = restaurantRestPath(pathname);
  const isKitchenOnly = role === "kitchen";

  // Deep-link guard for kitchen role
  useEffect(() => {
    if (!accessChecked || !allowed || !isKitchenOnly) return;
    const allowedHere = KITCHEN_ALLOWED_PATHS.some(
      (p) => restPath === p || restPath.startsWith(p + "/"),
    );
    if (!allowedHere) {
      router.replace(restaurantPath("/admin/kitchen", slug));
    }
  }, [accessChecked, allowed, isKitchenOnly, restPath, router, slug]);

  const tabDefs: TabDef[] = useMemo(
    () => [
      {
        path: "/admin/menu",
        labelFa: "منو",
        labelEn: "Menu",
        icon: <UtensilsCrossed size={16} />,
        module: "menu",
      },
      {
        path: "/admin",
        labelFa: "سفارش‌ها",
        labelEn: "Orders",
        icon: <Receipt size={16} />,
        module: "orders",
        kitchenAllowed: true,
      },
      {
        path: "/admin/kitchen",
        labelFa: "آشپزخانه",
        labelEn: "Kitchen",
        icon: <ChefHat size={16} />,
        module: "orders",
        kitchenAllowed: true,
      },
      {
        path: "/admin/tables",
        labelFa: "میزها",
        labelEn: "Tables",
        icon: <Grid3x3 size={16} />,
        module: "tables",
      },
      {
        path: "/admin/pages",
        labelFa: "لندینگ",
        labelEn: "Landing",
        icon: <LayoutTemplate size={16} />,
        module: "cms",
      },
      {
        path: "/admin/promotions",
        labelFa: "تخفیف‌ها",
        labelEn: "Promos",
        icon: <TicketPercent size={16} />,
        module: "orders",
      },
      {
        path: "/admin/media",
        labelFa: "تصاویر",
        labelEn: "Media",
        icon: <ImageIcon size={16} />,
        module: "menu",
      },
      {
        path: "/admin/reservations",
        labelFa: "رزرو",
        labelEn: "Reservations",
        icon: <CalendarDays size={16} />,
        module: "reservations",
      },
      {
        path: "/admin/settings",
        labelFa: "تنظیمات",
        labelEn: "Settings",
        icon: <SettingsIcon size={16} />,
      },
    ],
    [],
  );

  if (loading || !accessChecked || modules === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (!user || !allowed) return null;

  const moduleEnabled = (mod?: CatalogModuleId) => {
    if (!mod) return true;
    return modules.includes(mod);
  };

  const tabs = tabDefs
    .filter((t) => {
      if (!moduleEnabled(t.module ?? ADMIN_NAV_MODULES[t.path])) return false;
      if (isKitchenOnly) return Boolean(t.kitchenAllowed);
      return true;
    })
    .map((t) => ({
      ...t,
      href: restaurantPath(t.path, slug),
      active:
        t.path === "/admin"
          ? restPath === "/admin"
          : restPath === t.path || restPath.startsWith(t.path + "/"),
    }));

  const handleSignOut = async () => {
    await signOut();
    router.push(restaurantPath("", slug));
  };

  return (
    <div className="min-h-screen pt-16" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-black text-[#faf5e4]">
              {isRtl ? "پنل مدیریت رستوران" : "Restaurant Admin"}
            </h1>
            <p className="text-xs text-[#888]" dir="ltr">
              /r/{slug}/admin
              {role ? ` · ${role}` : ""}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 self-start rounded-xl border border-[#333] bg-[#1e1e1e] px-4 py-2.5 text-xs font-medium text-[#ccc] hover:border-red-500/40 hover:text-red-400"
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
                "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors -mb-px",
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
