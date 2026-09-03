"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Banknote, AlertCircle } from "lucide-react";
import { useCartContext } from "@/lib/providers/cart-provider";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { menuItems } from "@/lib/data";
import { formatPrice, calculateItemPrice, generateOrderId, getEstimatedTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { items, table, orderType, subtotal, discount, total, clearCart } = useCartContext();
  const { locale: ctxLocale } = useLocaleContext();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cashier">("online");
  const [isPlacing, setIsPlacing] = useState(false);

  const estimatedTime = getEstimatedTime(items, menuItems);

  const handlePlaceOrder = () => {
    setIsPlacing(true);
    const orderId = generateOrderId();
    setTimeout(() => {
      clearCart();
      router.push(`/${locale}/order/success?id=${orderId}${table ? `&table=${table}` : ""}&time=${estimatedTime}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-[#faf5e4] mb-6">
          {isRtl ? "تسویه حساب" : "Checkout"}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#888] mb-4">{isRtl ? "سبد خرید شما خالی است" : "Your cart is empty"}</p>
            <Button variant="primary" onClick={() => router.push(`/${locale}/menu`)}>
              {isRtl ? "بازگشت به منو" : "Back to Menu"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Demo notice */}
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm text-blue-400 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>
                {isRtl
                  ? "این یک نسخه دمو است. هیچ پرداختی انجام نمی‌شود."
                  : "This is a demo. No actual payment will be processed."}
              </span>
            </div>

            {/* Order summary */}
            <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4">
              <h3 className="text-sm font-semibold text-[#ccc] mb-3">
                {isRtl ? "خلاصه سفارش" : "Order Summary"}
              </h3>
              <div className="space-y-2">
                {items.map((cartItem, i) => {
                  const mi = menuItems.find((m) => m.id === cartItem.menuItemId);
                  if (!mi) return null;
                  return (
                    <div key={i} className="flex justify-between text-sm text-[#888]">
                      <span>{cartItem.quantity}x {isRtl ? mi.nameFa : mi.nameEn}</span>
                      <span className="tabular-nums">{formatPrice(calculateItemPrice(cartItem, menuItems), locale)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-[#1e1e1e] space-y-1">
                <div className="flex justify-between text-sm text-[#888]">
                  <span>{isRtl ? "جمع" : "Subtotal"}</span>
                  <span className="tabular-nums">{formatPrice(subtotal, locale)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#faf5e4]">
                  <span>{isRtl ? "مجموع" : "Total"}</span>
                  <span className="text-amber-400 tabular-nums">{formatPrice(total, locale)}</span>
                </div>
              </div>
            </div>

            {/* Order type & table */}
            <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">{isRtl ? "نوع سفارش" : "Order Type"}</span>
                <span className="text-[#ccc] font-medium">
                  {orderType === "dine-in"
                    ? isRtl ? "صرف در رستوران" : "Dine In"
                    : isRtl ? "بیرون‌بر" : "Takeaway"}
                </span>
              </div>
              {table && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#888]">{isRtl ? "میز" : "Table"}</span>
                  <span className="text-amber-400 font-bold">{table}</span>
                </div>
              )}
              {estimatedTime > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#888]">{isRtl ? "زمان تقریبی" : "Est. Time"}</span>
                  <span className="text-[#ccc]">{estimatedTime} {isRtl ? "دقیقه" : "min"}</span>
                </div>
              )}
            </div>

            {/* Customer info */}
            <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 space-y-3">
              <h3 className="text-sm font-semibold text-[#ccc]">
                {isRtl ? "اطلاعات مشتری" : "Customer Info"}
              </h3>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isRtl ? "نام (اختیاری)" : "Name (optional)"}
                className="w-full rounded-xl bg-[#0a0a0a] border border-[#222] px-4 py-3 text-sm text-[#ccc] placeholder-[#555] focus:outline-none focus:border-amber-500/40"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isRtl ? "شماره تماس" : "Phone number"}
                className="w-full rounded-xl bg-[#0a0a0a] border border-[#222] px-4 py-3 text-sm text-[#ccc] placeholder-[#555] focus:outline-none focus:border-amber-500/40"
                dir="ltr"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isRtl ? "توضیحات سفارش (اختیاری)" : "Order notes (optional)"}
                rows={3}
                className="w-full rounded-xl bg-[#0a0a0a] border border-[#222] px-4 py-3 text-sm text-[#ccc] placeholder-[#555] focus:outline-none focus:border-amber-500/40 resize-none"
              />
            </div>

            {/* Payment method */}
            <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4">
              <h3 className="text-sm font-semibold text-[#ccc] mb-3">
                {isRtl ? "روش پرداخت" : "Payment Method"}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setPaymentMethod("online")}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-sm transition-all border ${
                    paymentMethod === "online"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-[#0a0a0a] border-[#222] text-[#888] hover:border-[#333]"
                  }`}
                >
                  <CreditCard size={18} />
                  <span>{isRtl ? "پرداخت آنلاین" : "Online Payment"}</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("cashier")}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-sm transition-all border ${
                    paymentMethod === "cashier"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-[#0a0a0a] border-[#222] text-[#888] hover:border-[#333]"
                  }`}
                >
                  <Banknote size={18} />
                  <span>{isRtl ? "پرداخت در صندوق" : "Pay at Cashier"}</span>
                </button>
              </div>
            </div>

            {/* Place order */}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              disabled={isPlacing}
              onClick={handlePlaceOrder}
            >
              {isPlacing
                ? isRtl ? "در حال ثبت..." : "Placing order..."
                : isRtl ? `ثبت سفارش — ${formatPrice(total, locale)}` : `Place Order — ${formatPrice(total, locale)}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
