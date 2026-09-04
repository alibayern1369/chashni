"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Loader2, LayoutDashboard, Store, Users, Shield, LogOut } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";
import { displayLogin } from "@/lib/auth/identity";
import { superPath } from "@/lib/routes";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SuperShell>{children}</SuperShell>
    </AuthProvider>
  );
}

function SuperShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const isLogin = pathname === "/super/login";

  useEffect(() => {
    if (isLogin) {
      setChecked(true);
      setAllowed(true);
      return;
    }
    if (loading) return;
    if (!user) {
      router.replace(superPath("/login"));
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/super/profiles", { headers: { "x-preflight": "1" } });
        if (!mounted) return;
        if (!res.ok) {
          router.replace(superPath("/login"));
          return;
        }
        setAllowed(true);
      } catch {
        if (mounted) router.replace(superPath("/login"));
      } finally {
        if (mounted) setChecked(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user, loading, router, isLogin]);

  if (isLogin) return <>{children}</>;

  if (loading || !checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (!user || !allowed) return null;

  const tabs = [
    { href: superPath(), labelFa: "داشبورد", icon: <LayoutDashboard size={16} />, active: pathname === "/super" },
    { href: superPath("/tenants"), labelFa: "رستوران‌ها", icon: <Store size={16} />, active: pathname.includes("/super/tenants") },
    { href: superPath("/users"), labelFa: "کاربران", icon: <Users size={16} />, active: pathname.includes("/super/users") },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push(superPath("/login"));
  };

  const loginLabel = displayLogin(
    user.email,
    (user.user_metadata as { username?: string } | undefined)?.username,
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-[#faf5e4]">
              <Shield size={22} className="text-amber-400" />
              سوپر ادمین پلتفرم
            </h1>
            <p className="text-xs text-[#888]" dir="ltr">{loginLabel}</p>
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
                tab.active ? "border-amber-500 text-amber-400" : "border-transparent text-[#888] hover:text-[#ccc]",
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
