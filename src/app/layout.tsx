import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CHASHNI | چاشنی — Premium Restaurant",
    template: "%s | CHASHNI چاشنی",
  },
  description: "CHASHNI — Premium QR Restaurant Experience. A mobile-first bilingual restaurant menu and ordering experience.",
  manifest: "/manifest.json",
  openGraph: {
    title: "CHASHNI | چاشنی",
    description: "A Taste You Won't Forget — Premium Burgers, Pizza & More",
    type: "website",
    locale: "fa_IR",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CHASHNI | چاشنی",
    description: "A Taste You Won't Forget — Premium Burgers, Pizza & More",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a0a]">{children}</body>
    </html>
  );
}
