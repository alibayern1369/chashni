"use client";

import { useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import type { Locale } from "@/lib/types";

const tables = [
  { number: "01", color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30" },
  { number: "03", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
  { number: "07", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30" },
  { number: "12", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
];

const emptySubscribe = () => () => {};

export default function QrDemoPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";

  const origin = useSyncExternalStore(
    emptySubscribe,
    () => (typeof window === "undefined" ? "" : window.location.origin),
    () => ""
  );

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl text-center mb-10">
        <h1 className="text-3xl font-black text-[#faf5e4] mb-2 tracking-tight">CHASHNI QR Tables</h1>
        <p className="text-sm text-[#888]">
          {isRtl
            ? "هر میز QR کد اختصاصی خودش را دارد. مشتریان با اسکن کد وارد منو می‌شوند."
            : "Each table has its own QR code. Customers scan to access the menu."}
        </p>
      </div>

      <div className="mx-auto max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map((t) => {
          const url = `${origin}/${locale}/menu?table=${t.number}`;
          return (
            <div
              key={t.number}
              className={`rounded-2xl bg-gradient-to-br ${t.color} border ${t.border} p-6 flex flex-col items-center gap-4`}
            >
              <span className="text-xs font-bold text-[#888] uppercase tracking-wider">
                {isRtl ? "میز" : "Table"}
              </span>
              <span className="text-3xl font-black text-[#faf5e4]">{t.number}</span>
              <div className="bg-white rounded-xl p-3">
                <QRCodeSVG value={url} size={120} level="H" />
              </div>
              <span className="text-[10px] text-[#666] font-mono break-all">{url}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
