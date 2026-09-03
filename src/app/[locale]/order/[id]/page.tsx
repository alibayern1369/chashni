"use client";

import { useParams } from "next/navigation";
import { OrderTimeline } from "@/components/order/order-timeline";
import type { Locale } from "@/lib/types";

export default function OrderTrackingPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const orderId = params.id as string;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-[#faf5e4] mb-2">
          {isRtl ? "پیگیری سفارش" : "Track Order"}
        </h1>
        <p className="text-sm text-[#888] mb-8">
          {isRtl ? "شماره سفارش:" : "Order ID:"}{" "}
          <span className="font-mono font-bold text-amber-400">{orderId}</span>
        </p>

        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-5">
          <OrderTimeline initialStatus="received" autoProgress />
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#555]">
            {isRtl
              ? "وضعیت سفارش به صورت خودکار به‌روز می‌شود"
              : "Order status updates automatically for demo"}
          </p>
        </div>
      </div>
    </div>
  );
}
