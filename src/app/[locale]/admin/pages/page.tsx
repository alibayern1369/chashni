"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale, Page } from "@/lib/types";

export default function AdminPagesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title_fa: "", title_en: "" });

  const loadPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load pages");
        return;
      }
      setPages(data.pages ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const createPage = async () => {
    if (!form.title_fa || !form.title_en) return;
    const res = await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ title_fa: "", title_en: "" });
      loadPages();
    } else {
      const data = await res.json();
      setError(data?.error || "Create failed");
    }
  };

  const togglePublish = async (page: Page) => {
    const res = await fetch(`/api/admin/pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !page.is_published }),
    });
    if (res.ok) {
      setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, is_published: !p.is_published } : p)));
    }
  };

  const deletePage = async (id: string) => {
    const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPages((prev) => prev.filter((p) => p.id !== id));
    }
  };

  if (loading && pages.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#faf5e4]">
          {isRtl ? "مدیریت صفحات لندینگ" : "Landing Pages CMS"}
        </h2>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-black hover:bg-amber-400"
        >
          <Plus size={14} />
          {isRtl ? "صفحه جدید" : "New Page"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showCreate && (
        <div className="rounded-2xl bg-[#141414] border border-[#2a2010] p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#faf5e4]">
            {isRtl ? "ایجاد صفحه جدید" : "Create New Page"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={form.title_fa}
              onChange={(e) => setForm({ ...form, title_fa: e.target.value })}
              placeholder={isRtl ? "عنوان فارسی" : "Persian title"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
            <input
              value={form.title_en}
              onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              placeholder={isRtl ? "عنوان انگلیسی" : "English title"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={createPage}
            disabled={!form.title_fa || !form.title_en}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40"
          >
            {isRtl ? "ایجاد صفحه" : "Create Page"}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {pages.map((page) => (
          <div
            key={page.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[#faf5e4]">
                  {isRtl ? page.title_fa : page.title_en}
                </p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    page.is_published
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-[#222] text-[#666]",
                  )}
                >
                  {isRtl ? (page.is_published ? "منتشر شده" : "پیش‌نویس") : page.is_published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-xs text-[#666]" dir="ltr">/{page.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => togglePublish(page)}
                className="rounded-lg bg-[#1e1e1e] border border-[#333] p-2 text-[#ccc] hover:border-[#444]"
                title={isRtl ? "انتشار/پیش‌نویس" : "Publish/Draft"}
              >
                {page.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => router.push(`/${locale}/admin/pages/${page.id}`)}
                className="rounded-lg bg-[#1e1e1e] border border-[#333] p-2 text-amber-400 hover:border-amber-500/40"
                title={isRtl ? "ویرایش" : "Edit"}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => deletePage(page.id)}
                className="rounded-lg bg-[#1e1e1e] border border-[#333] p-2 text-[#666] hover:border-red-500/40 hover:text-red-400"
                title={isRtl ? "حذف" : "Delete"}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {pages.length === 0 && (
        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-10 text-center text-sm text-[#888]">
          {isRtl ? "صفحه‌ای وجود ندارد" : "No pages yet"}
        </div>
      )}
    </div>
  );
}