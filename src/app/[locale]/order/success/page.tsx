"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { OrderSuccess } from "@/components/order/order-success";
import type { Locale } from "@/lib/types";

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params.locale as Locale) || "fa";

  const orderId = searchParams.get("id") || undefined;
  const table = searchParams.get("table") || undefined;
  const time = parseInt(searchParams.get("time") || "0", 10);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <OrderSuccess
        orderId={orderId}
        table={table}
        estimatedTime={time || undefined}
        total={0}
        onContinue={() => {
          if (orderId) {
            router.push(`/${locale}/order/${orderId}`);
          } else {
            router.push(`/${locale}/menu`);
          }
        }}
      />
    </div>
  );
}
