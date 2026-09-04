"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, Save, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface Block {
  id: string;
  page_id: string;
  type: string;
  content: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
}

interface PageRow {
  id: string;
  slug: string;
  title_fa: string;
  title_en: string;
  description_fa: string | null;
  description_en: string | null;
  is_published: boolean;
  meta_title: string | null;
  meta_description: string | null;
}

export default function AdminPageEditor() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const pageId = params.id as string;

  const [page, setPage] = useState<PageRow | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load page");
        return;
      }
      setPage(data.page);
      setBlocks(data.blocks ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    load();
  }, [load]);

  const savePageMeta = async (updates: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setPage(data.page);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const updateBlock = async (block: Block, content: Record<string, unknown>) => {
    const next = blocks.map((b) => (b.id === block.id ? { ...b, content } : b));
    setBlocks(next);
    const res = await fetch(`/api/admin/blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const setBlockVisible = async (block: Block, is_visible: boolean) => {
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, is_visible } : b)));
    await fetch(`/api/admin/blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_visible }),
    });
  };

  const blockLabel = (type: string) => {
    const map: Record<string, { fa: string; en: string }> = {
      hero: { fa: "بخش قهرمان (Hero)", en: "Hero" },
      about: { fa: "درباره ما", en: "About" },
      features: { fa: "ویژگی‌ها", en: "Features" },
      menu_preview: { fa: "پیش‌نمایش منو", en: "Menu Preview" },
      gallery: { fa: "گالری", en: "Gallery" },
      contact: { fa: "تماس", en: "Contact" },
      cta: { fa: "دعوت به اقدام", en: "CTA" },
      text: { fa: "متن", en: "Text" },
    };
    return map[type] ?? { fa: type, en: type };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  const meta = page.meta_title || "";
  const metaDesc = page.meta_description || "";

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/admin/pages`}
            className="rounded-lg bg-[#1e1e1e] border border-[#333] p-2 text-[#ccc] hover:border-[#444]"
          >
            <ArrowRight size={14} className={cn(isRtl && "rotate-180")} />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-[#faf5e4]">
              {isRtl ? page.title_fa : page.title_en}
            </h2>
            <p className="text-xs text-[#666]" dir="ltr">/{page.slug}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-2 text-xs font-bold", saved ? "text-emerald-400" : "text-[#555]")}>
          <Check size={14} />
          {isRtl ? (saved ? "ذخیره شد" : "ذخیره خودکار") : saved ? "Saved" : "Auto-save"}
        </div>
      </div>

      {/* Page meta */}
      <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#666]">
          {isRtl ? "متادیتای سئو" : "SEO Meta"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            defaultValue={meta}
            onBlur={(e) => e.target.value !== meta && savePageMeta({ meta_title: e.target.value })}
            placeholder={isRtl ? "عنوان سئو" : "SEO title"}
            className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
          />
          <input
            defaultValue={metaDesc}
            onBlur={(e) => e.target.value !== metaDesc && savePageMeta({ meta_description: e.target.value })}
            placeholder={isRtl ? "توضیح سئو" : "SEO description"}
            className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-4">
        {blocks.length === 0 && (
          <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-10 text-center text-sm text-[#888]">
            {isRtl ? "بلاکی وجود ندارد" : "No blocks yet"}
          </div>
        )}
        {blocks.map((block) => {
          const label = blockLabel(block.type);
          const c = block.content as Record<string, unknown>;
          return (
            <div
              key={block.id}
              className={cn(
                "rounded-2xl bg-[#141414] border p-5 space-y-3",
                block.is_visible ? "border-[#1e1e1e]" : "border-red-500/20 opacity-70",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#faf5e4]">
                  {isRtl ? label.fa : label.en}
                </h3>
                <button
                  onClick={() => setBlockVisible(block, !block.is_visible)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-bold",
                    block.is_visible
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400",
                  )}
                >
                  {isRtl ? (block.is_visible ? "نمایش" : "مخفی") : block.is_visible ? "Visible" : "Hidden"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "heading", label: isRtl ? "عنوان (EN)" : "Heading (EN)" },
                  { key: "headingFa", label: isRtl ? "عنوان (FA)" : "Heading (FA)" },
                  { key: "subtitle", label: isRtl ? "زیرعنوان (EN)" : "Subtitle (EN)" },
                  { key: "subtitleFa", label: isRtl ? "زیرعنوان (FA)" : "Subtitle (FA)" },
                  { key: "buttonText", label: isRtl ? "متن دکمه (EN)" : "Button (EN)" },
                  { key: "buttonTextFa", label: isRtl ? "متن دکمه (FA)" : "Button (FA)" },
                  { key: "imageUrl", label: isRtl ? "آدرس تصویر" : "Image URL" },
                  { key: "imageUrlFa", label: isRtl ? "آدرس تصویر (FA)" : "Image URL (FA)" },
                ]
                  .filter((f) => f.key in c || block.type === "hero")
                  .map((f) => (
                    <div key={f.key}>
                      <label className="mb-1 block text-[11px] text-[#666]">{f.label}</label>
                      <input
                        defaultValue={String(c[f.key] ?? "")}
                        onBlur={(e) => {
                          const v = e.target.value;
                          if (String(c[f.key] ?? "") !== v) {
                            updateBlock(block, { ...c, [f.key]: v });
                          }
                        }}
                        className="w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
                      />
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => savePageMeta({ is_published: true })}
        className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400"
      >
        <Save size={14} />
        {isRtl ? "انتشار صفحه" : "Publish Page"}
      </button>
    </div>
  );
}