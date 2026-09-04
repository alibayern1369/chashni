"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ChefHat, Clock, CheckCircle2 } from "lucide-react";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

interface OrderTimelineProps {
  /** Controlled status from DB (preferred) */
  status?: OrderStatus;
  initialStatus?: OrderStatus;
  autoProgress?: boolean;
  className?: string;
}

const statuses: { key: OrderStatus; labelFa: string; labelEn: string }[] = [
  { key: "received", labelFa: "دریافت شد", labelEn: "Received" },
  { key: "preparing", labelFa: "در حال آماده‌سازی", labelEn: "Preparing" },
  { key: "ready", labelFa: "آماده تحویل", labelEn: "Ready" },
  { key: "completed", labelFa: "تکمیل شد", labelEn: "Completed" },
];

const statusIcons: Record<OrderStatus, typeof Check> = {
  received: Check,
  preparing: ChefHat,
  ready: Clock,
  completed: CheckCircle2,
};

function mapDbStatus(raw: string): OrderStatus {
  if (raw === "confirmed" || raw === "preparing") return "preparing";
  if (raw === "ready" || raw === "served") return "ready";
  if (raw === "completed") return "completed";
  if (raw === "cancelled") return "completed";
  return "received";
}

export function OrderTimeline({
  status,
  initialStatus = "received",
  autoProgress = false,
  className,
}: OrderTimelineProps) {
  const { locale } = useLocaleContext();
  const controlled = status ? mapDbStatus(status) : null;
  const [currentStatus, setCurrentStatus] = useState(controlled ?? initialStatus);

  useEffect(() => {
    if (controlled) setCurrentStatus(controlled);
  }, [controlled]);

  const currentIndex = statuses.findIndex((s) => s.key === currentStatus);

  useEffect(() => {
    if (!autoProgress || controlled) return;
    if (currentStatus === "completed") return;

    const timer = setTimeout(() => {
      const nextIndex = statuses.findIndex((s) => s.key === currentStatus) + 1;
      if (nextIndex < statuses.length) {
        setCurrentStatus(statuses[nextIndex].key);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentStatus, autoProgress, controlled]);

  return (
    <div className={cn("space-y-0", className)}>
      {statuses.map((s, index) => {
        const Icon = statusIcons[s.key];
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={s.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted || isCurrent ? "#f59e0b" : "#1e1e1e",
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 shrink-0",
                  isCompleted || isCurrent ? "border-amber-400" : "border-[#333]",
                )}
              >
                <Icon
                  size={18}
                  className={cn(isCompleted || isCurrent ? "text-black" : "text-[#555]")}
                />
              </motion.div>
              {index < statuses.length - 1 && (
                <div className={cn("w-0.5 h-8", isCompleted ? "bg-amber-400" : "bg-[#252525]")} />
              )}
            </div>

            <div className="pb-8 pt-2">
              <p
                className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-amber-400" : isCompleted ? "text-[#ccc]" : "text-[#555]",
                )}
              >
                {locale === "fa" ? s.labelFa : s.labelEn}
              </p>
              {isCurrent && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-[#888] mt-0.5"
                >
                  {locale === "fa" ? "در حال حاضر..." : "In progress..."}
                </motion.p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
