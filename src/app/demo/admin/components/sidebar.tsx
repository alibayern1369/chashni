"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  QrCode,
  Settings,
  Menu,
  X,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/demo/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/demo/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/demo/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/demo/admin/qr", label: "QR Codes", icon: QrCode },
  { href: "/demo/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#1e1e1e] px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <Flame size={18} />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-[#faf5e4]">CHASHNI</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#666]">Admin</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-[#888] transition-colors hover:bg-[#1e1e1e] hover:text-[#faf5e4] lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                active
                  ? "bg-amber-500/15 text-amber-400"
                  : "text-[#888] hover:bg-[#1e1e1e] hover:text-[#ccc]"
              )}
            >
              <item.icon
                size={18}
                className={active ? "text-amber-400" : "text-[#666]"}
              />
              {item.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#1e1e1e] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555]">
          CHASHNI Restaurant
        </p>
        <p className="mt-1 text-xs text-[#666]">A Taste You Won&apos;t Forget</p>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[#1e1e1e] bg-[#0a0a0a]/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-1.5 text-[#faf5e4] transition-colors hover:bg-[#1e1e1e]"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
            <Flame size={16} />
          </div>
          <span className="text-sm font-black tracking-tight text-[#faf5e4]">CHASHNI</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#666]">
            Admin
          </span>
        </div>
      </header>

      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 border-r border-[#1e1e1e] bg-[#141414] lg:block">
        {content}
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed left-0 top-0 z-50 h-full w-64 border-r border-[#1e1e1e] bg-[#141414] lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
