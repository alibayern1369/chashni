"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, Banknote, AlertCircle, MapPin } from "lucide-react";
import { useCartContext } from "@/lib/providers/cart-provider";
import { useMenuContext } from "@/lib/providers/data-provider";
import { formatPrice, calculateItemPrice, getEstimatedTime, getCustomBurgerName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const {
    items,
    table,
    orderType,
    setOrderType,
    subtotal,
    total,
    clearCart,
    setDiscount,
  } = useCartContext();
  const { menuItems, restaurant } = useMenuContext();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cashier">("cashier");
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const estimatedTime = getEstimatedTime(items, menuItems);
  const displayTotal = Math.max(0, total - promoDiscount);

  useEffect(() => {
    fetch("/api/restaurant")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const mods: string[] = data?.tenant?.enabled_modules ?? [];
        setPaymentEnabled(mods.includes("payment"));
        setDeliveryEnabled(mods.includes("delivery"));
        if (!mods.includes("payment")) setPaymentMethod("cashier");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setDiscount?.(promoDiscount);
  }, [promoDiscount, setDiscount]);

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    setPlaceError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          table,
          orderType,
          customerName: name || undefined,
          customerPhone: phone || undefined,
          notes: notes || undefined,
          paymentMethod,
          promoCode: promoCode || undefined,
          deliveryAddress:
            orderType === "delivery" ? deliveryAddress || undefined : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPlaceError(
          (data?.error as string) ||
            (isRtl ? "خطا در ثبت سفارش" : "Failed to place order"),
        );
        setIsPlacing(false);
        return;
      }

      const orderId = data?.order?.id;
      if (!orderId) {
        setPlaceError(isRtl ? "سفارش ثبت نشد" : "Order was not created");
        setIsPlacing(false);
        return;
      }

      if (data.paymentRequired) {
        const payRes = await fetch("/api/payments/zarinpal/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const payData = await payRes.json();
        if (payRes.ok && payData.paymentUrl) {
          clearCart();
          window.location.href = payData.paymentUrl;
          return;
        }
        setPlaceError(
          payData?.error ||
            (isRtl ? "خطا در اتصال به درگاه" : "Payment gateway error"),
        );
        setIsPlacing(false);
        return;
      }

      clearCart();
      router.push(
        `/${locale}/order/success?id=${orderId}${table ? `&table=${table}` : ""}&time=${estimatedTime}`,
      );
    } catch {
      setPlaceError(
        isRtl
          ? "اتصال به سرور برقرار نشد. لطفاً دوباره تلاش کنید."
          : "Could not reach the server. Please try again.",
      );
      setIsPlacing(false);
    }
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
            {!paymentEnabled && (
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm text-blue-400 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>
                  {isRtl
                    ? "پرداخت آنلاین برای این رستوران فعال نیست — پرداخت در صندوق."
                    : "Online payment is not enabled — pay at cashier."}
                </span>
              </div>
            )}

            <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4">
              <h3 className="text-sm font-semibold text-[#ccc] mb-3">
                {isRtl ? "خلاصه سفارش" : "Order Summary"}
              </h3>
              <div className="space-y-2">
                {items.map((cartItem, i) => {
                  const isBurger = cartItem.menuItemId === "custom-burger";
                  const mi = !isBurger ? menuItems.find((m) => m.id === cartItem.menuItemId) : null;
                  const itemName = isBurger
                    ? getCustomBurgerName(cartItem.customBurger!, locale)
                    : mi
                      ? (isRtl ? mi.nameFa : mi.nameEn)
                      : "";
                  return (
                    <div key={i} className="text-sm text-[#888]">
                      <div className="flex justify-between">
                        <span>{cartItem.quantity}x {itemName}</span>
                        <span className="tabular-nums">{formatPrice(calculateItemPrice(cartItem, menuItems), locale)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-[#1e1e1e] space-y-1">
                <div className="flex justify-between text-sm text-[#888]">
                  <span>{isRtl ? "جمع" : "Subtotal"}</span>
                  <span className="tabular-nums">{formatPrice(subtotal, locale)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-400">
                    <span>{isRtl ? "تخفیف" : "Discount"}</span>
                    <span className="tabular-nums">−{formatPrice(promoDiscount, locale)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#faf5e4]">
                  <span>{isRtl ? "مجموع" : "Total"}</span>
                  <span className="text-amber-400 tabular-nums">{formatPrice(displayTotal, locale)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 space-y-3">
              <h3 className="text-sm font-semibold text-[#ccc]">
                {isRtl ? "نوع سفارش" : "Order Type"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(["dine-in", "takeaway", ...(deliveryEnabled ? (["delivery"] as const) : [])] as const).map(
                  (t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`rounded-xl px-3 py-2 text-xs font-bold border ${
                        orderType === t
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-[#0a0a0a] border-[#222] text-[#888]"
                      }`}
                    >
                      {t === "dine-in"
                        ? isRtl
                          ? "داخل سالن"
                          : "Dine-in"
                        : t === "takeaway"
                          ? isRtl
                            ? "بیرون‌بر"
                            : "Takeaway"
                          : isRtl
                            ? "ارسال"
                            : "Delivery"}
                    </button>
                  ),
                )}
              </div>
              {table && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#888]">{isRtl ? "میز" : "Table"}</span>
                  <span className="text-amber-400 font-bold">{table}</span>
                </div>
              )}
              {orderType === "delivery" && (
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-3.5 text-[#666]" />
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder={isRtl ? "آدرس ارسال" : "Delivery address"}
                    rows={2}
                    className="w-full rounded-xl bg-[#0a0a0a] border border-[#222] px-4 py-3 pl-9 text-sm text-[#ccc] placeholder-[#555] focus:outline-none focus:border-amber-500/40 resize-none"
                  />
                </div>
              )}
              {estimatedTime > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#888]">{isRtl ? "زمان تقریبی" : "Est. Time"}</span>
                  <span className="text-[#ccc]">{estimatedTime} {isRtl ? "دقیقه" : "min"}</span>
                </div>
              )}
              <p className="text-[11px] text-[#555]">{restaurant.nameFa}</p>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 space-y-3">
              <h3 className="text-sm font-semibold text-[#ccc]">
                {isRtl ? "کد تخفیف" : "Promo code"}
              </h3>
              <div className="flex gap-2">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder={isRtl ? "کد" : "Code"}
                  className="flex-1 rounded-xl bg-[#0a0a0a] border border-[#222] px-4 py-3 text-sm text-[#ccc] placeholder-[#555] focus:outline-none focus:border-amber-500/40"
                  dir="ltr"
                />
              </div>
              <p className="text-[11px] text-[#666]">
                {isRtl
                  ? "تخفیف هنگام ثبت سفارش اعمال می‌شود"
                  : "Discount is applied when you place the order"}
              </p>
            </div>

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

            <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4">
              <h3 className="text-sm font-semibold text-[#ccc] mb-3">
                {isRtl ? "روش پرداخت" : "Payment Method"}
              </h3>
              <div className="space-y-2">
                {paymentEnabled && (
                  <button
                    onClick={() => setPaymentMethod("online")}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-sm transition-all border ${
                      paymentMethod === "online"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-[#0a0a0a] border-[#222] text-[#888] hover:border-[#333]"
                    }`}
                  >
                    <CreditCard size={18} />
                    <span>{isRtl ? "پرداخت آنلاین (زرین‌پال)" : "Online (Zarinpal)"}</span>
                  </button>
                )}
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

            {placeError && (
              <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{placeError}</span>
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              size="lg"
              disabled={
                isPlacing || (orderType === "delivery" && !deliveryAddress.trim())
              }
              onClick={handlePlaceOrder}
            >
              {isPlacing
                ? isRtl
                  ? "در حال ثبت..."
                  : "Placing order..."
                : isRtl
                  ? `ثبت سفارش — ${formatPrice(displayTotal, locale)}`
                  : `Place Order — ${formatPrice(displayTotal, locale)}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
