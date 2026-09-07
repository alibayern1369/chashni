import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-vazirmatn-variable",
});

export const metadata: Metadata = {
  title: {
    default: "نمکدان | Namakdan — Premium Restaurant",
    template: "%s | نمکدان Namakdan",
  },
  description: "نمکدان — منوی دیجیتال و سفارش رستوران. تجربه دو زبانه موبایل‌فرست.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/namakdan/logo.svg", type: "image/svg+xml" },
      { url: "/namakdan/logo.png", type: "image/png" },
    ],
    apple: "/namakdan/logo.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "نمکدان | Namakdan",
    description: "A Taste You Won't Forget — Premium Burgers, Pizza & More",
    type: "website",
    locale: "fa_IR",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "نمکدان | Namakdan",
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
    <html lang="fa" dir="rtl" className={`h-full antialiased ${vazirmatn.variable}`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
