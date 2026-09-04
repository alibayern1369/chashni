"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { CmsBlocks } from "@/components/cms/cms-blocks";
import type { Locale, Page, PageBlock } from "@/lib/types";

export default function PublicCmsPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const slug = params.slug as string;
  const [page, setPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/pages?slug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (!res.ok || !data.page) {
      setMissing(true);
      setLoading(false);
      return;
    }
    setPage(data.page);
    setBlocks(data.blocks ?? []);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (missing || !page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
        <p className="text-[#888]">{locale === "fa" ? "صفحه پیدا نشد" : "Page not found"}</p>
        <Link href={`/${locale}/menu`} className="text-amber-400 text-sm">
          {locale === "fa" ? "منو" : "Menu"}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="border-b border-[#1e1e1e] px-6 py-4">
        <h1 className="text-xl font-bold text-[#faf5e4]">
          {locale === "fa" ? page.title_fa : page.title_en}
        </h1>
      </div>
      <CmsBlocks blocks={blocks} locale={locale} />
    </div>
  );
}
