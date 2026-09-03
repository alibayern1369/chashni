"use client";

import { useRef, useCallback } from "react";
import { useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import type { Locale } from "@/lib/types";

const tables = [
  { number: "01", color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30", accent: "#f59e0b" },
  { number: "03", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30", accent: "#10b981" },
  { number: "07", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", accent: "#a855f7" },
  { number: "12", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", accent: "#3b82f6" },
];

const emptySubscribe = () => () => {};

function svgToPng(svgElement: SVGSVGElement): Promise<string> {
  return new Promise((resolve) => {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = url;
  });
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export default function QrDemoPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const cardsRef = useRef<HTMLDivElement>(null);

  const origin = useSyncExternalStore(
    emptySubscribe,
    () => (typeof window === "undefined" ? "" : window.location.origin),
    () => ""
  );

  const handleDownloadOne = useCallback(async (tableNumber: string) => {
    if (!origin) return;
    const container = document.getElementById(`qr-card-${tableNumber}`);
    if (!container) return;
    const svg = container.querySelector("svg");
    if (!svg) return;
    const png = await svgToPng(svg as SVGSVGElement);
    downloadDataUrl(png, `chashni-qr-table-${tableNumber}.png`);
  }, [origin]);

  const handleDownloadAll = useCallback(async () => {
    if (!origin) return;
    for (const t of tables) {
      await handleDownloadOne(t.number);
      await new Promise((r) => setTimeout(r, 300));
    }
  }, [origin, handleDownloadOne]);

  const handlePrint = useCallback(() => {
    if (!origin) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const cards = tables.map((t) => {
      const url = `${origin}/${locale}/menu?table=${t.number}`;
      return `
        <div style="display:inline-block;text-align:center;padding:32px;border:1px solid #ddd;border-radius:16px;margin:12px;page-break-inside:avoid;">
          <p style="font-size:14px;color:#666;margin:0 0 4px;">${isRtl ? "میز" : "Table"}</p>
          <p style="font-size:48px;font-weight:900;color:#111;margin:0 0 16px;">${t.number}</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}" width="200" height="200" style="margin:0 0 12px;" />
          <p style="font-size:11px;color:#999;font-family:monospace;word-break:break-all;">${url}</p>
          <p style="font-size:11px;color:#f59e0b;font-weight:bold;margin-top:8px;">CHASHNI — چاشنی</p>
        </div>`;
    }).join("");

    printWindow.document.write(`
      <html><head><title>CHASHNI QR Codes</title>
      <style>body{font-family:sans-serif;text-align:center;padding:40px;}</style>
      </head><body>${cards}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 800);
  }, [origin, locale, isRtl]);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl text-center mb-10">
        <h1 className="text-3xl font-black text-[#faf5e4] mb-2 tracking-tight">
          {isRtl ? "کدهای QR میزها" : "CHASHNI QR Tables"}
        </h1>
        <p className="text-sm text-[#888] mb-6">
          {isRtl
            ? "هر میز QR کد اختصاصی خودش را دارد. مشتریان با اسکن کد وارد منو می‌شوند."
            : "Each table has its own QR code. Customers scan to access the menu."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleDownloadAll}
            disabled={!origin}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 transition-colors disabled:opacity-40"
          >
            <Download size={16} />
            {isRtl ? "دانلود همه" : "Download All"}
          </button>
          <button
            onClick={handlePrint}
            disabled={!origin}
            className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#141414] px-5 py-2.5 text-sm font-bold text-[#ccc] hover:border-[#555] transition-colors disabled:opacity-40"
          >
            <Printer size={16} />
            {isRtl ? "چاپ" : "Print All"}
          </button>
        </div>
      </div>

      <div ref={cardsRef} className="mx-auto max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map((t) => {
          const url = `${origin}/${locale}/menu?table=${t.number}`;
          return (
            <div
              key={t.number}
              id={`qr-card-${t.number}`}
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
              <button
                onClick={() => handleDownloadOne(t.number)}
                disabled={!origin}
                className="flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-[#ccc] hover:bg-black/60 transition-colors disabled:opacity-40"
              >
                <Download size={12} />
                {isRtl ? "دانلود" : "Download"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
