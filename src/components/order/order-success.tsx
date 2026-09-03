"use client";

import { motion } from "framer-motion";
import { CheckCircle, Hash, MapPin, Clock } from "lucide-react";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { cn, formatPrice, generateOrderId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/lib/types";

interface OrderSuccessProps {
  orderId?: string;
  table?: string;
  estimatedTime?: number;
  items?: CartItem[];
  total?: number;
  onContinue?: () => void;
  className?: string;
}

export function OrderSuccess({
  orderId,
  table,
  estimatedTime,
  items = [],
  total = 0,
  onContinue,
  className,
}: OrderSuccessProps) {
  const { locale } = useLocaleContext();
  const id = orderId || generateOrderId();

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/20">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold text-[#faf5e4] mb-2"
      >
        {locale === "fa" ? "سفارش ثبت شد!" : "Order Confirmed!"}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-[#888] mb-6"
      >
        {locale === "fa" ? "سفارش شما در حال آماده‌سازی است" : "Your order is being prepared"}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm space-y-3 mb-6"
      >
        <div className="flex items-center justify-between rounded-xl bg-[#141414] border border-[#1e1e1e] px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-[#888]">
            <Hash size={14} />
            {locale === "fa" ? "شماره سفارش" : "Order ID"}
          </div>
          <span className="text-sm font-bold text-amber-400 font-mono">{id}</span>
        </div>

        {table && (
          <div className="flex items-center justify-between rounded-xl bg-[#141414] border border-[#1e1e1e] px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-[#888]">
              <MapPin size={14} />
              {locale === "fa" ? "میز" : "Table"}
            </div>
            <span className="text-sm font-bold text-[#faf5e4]">{table}</span>
          </div>
        )}

        {estimatedTime && estimatedTime > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-[#141414] border border-[#1e1e1e] px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-[#888]">
              <Clock size={14} />
              {locale === "fa" ? "زمان تقریبی" : "Est. Time"}
            </div>
            <span className="text-sm font-bold text-[#faf5e4]">
              {estimatedTime} {locale === "fa" ? "دقیقه" : "min"}
            </span>
          </div>
        )}

        {items.length > 0 && (
          <div className="rounded-xl bg-[#141414] border border-[#1e1e1e] px-4 py-3">
            <p className="text-xs text-[#666] mb-2">{locale === "fa" ? "اقلام سفارش" : "Order Items"}</p>
            <div className="space-y-1">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-[#888]">
                  <span>{item.quantity}x {item.menuItemId}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-[#1e1e1e] flex justify-between">
              <span className="text-sm font-semibold text-[#faf5e4]">
                {locale === "fa" ? "مجموع" : "Total"}
              </span>
              <span className="text-sm font-bold text-amber-400">{formatPrice(total, locale)}</span>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm"
      >
        <Button variant="primary" fullWidth onClick={onContinue}>
          {locale === "fa" ? "بازگشت به منو" : "Back to Menu"}
        </Button>
      </motion.div>
    </div>
  );
}
