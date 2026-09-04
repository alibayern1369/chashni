"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { OrderTimeline } from "@/components/order/order-timeline";
import { formatPrice } from "@/lib/utils";
import type { DBOrder, Locale, OrderStatus } from "@/lib/types";

export default function OrderTrackingPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const orderId = params.id as string;

  const [order, setOrder] = useState<DBOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Not found");
        return;
      }
      setOrder(data.order);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-amber-400" size={24} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen px-4 py-12 text-center text-red-400">
        {error || (isRtl ? "سفارش پیدا نشد" : "Order not found")}
      </div>
    );
  }

  const uiStatus = order.status as OrderStatus;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-[#faf5e4] mb-2">
          {isRtl ? "پیگیری سفارش" : "Track Order"}
        </h1>
        <p className="text-sm text-[#888] mb-2">
          {isRtl ? "شماره سفارش:" : "Order #:"}{" "}
          <span className="font-mono font-bold text-amber-400">#{order.order_number}</span>
        </p>
        <p className="text-xs text-[#666] mb-8" dir="ltr">
          {order.id}
        </p>

        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-5">
          <OrderTimeline status={uiStatus} />
        </div>

        <div className="mt-4 rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 space-y-2">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-[#ccc]">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span className="text-[#888]">{formatPrice(item.totalPrice, locale)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-[#1e1e1e] pt-2 font-bold text-[#faf5e4]">
            <span>{isRtl ? "مجموع" : "Total"}</span>
            <span className="text-amber-400">{formatPrice(order.total, locale)}</span>
          </div>
          {order.payment_status && (
            <p className="text-xs text-[#666]">
              {isRtl ? "پرداخت:" : "Payment:"} {order.payment_status}
              {order.payment_method ? ` (${order.payment_method})` : ""}
            </p>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#555]">
            {isRtl
              ? "وضعیت از سرور به‌روز می‌شود"
              : "Status updates from the kitchen"}
          </p>
        </div>
      </div>
    </div>
  );
}
