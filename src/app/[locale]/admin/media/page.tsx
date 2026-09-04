"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, Plus, Link2, Copy, Check } from "lucide-react";
import type { Locale, Media } from "@/lib/types";

export default function AdminMediaPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ file_url: "", file_name: "", alt_text: "" });
  const [copied, setCopied] = useState<string | null>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load media");
        return;
      }
      setMedia(data.media ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const addMedia = async () => {
    if (!form.file_url || !form.file_name) return;
    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowAdd(false);
      setForm({ file_url: "", file_name: "", alt_text: "" });
      loadMedia();
    } else {
      const data = await res.json();
      setError(data?.error || "Add failed");
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  if (loading && media.length === 0) {
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
          {isRtl ? "کتابخانه تصاویر" : "Media Library"}
        </h2>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-black hover:bg-amber-400"
        >
          <Plus size={14} />
          {isRtl ? "افزودن تصویر" : "Add Image"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showAdd && (
        <div className="rounded-2xl bg-[#141414] border border-[#2a2010] p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#faf5e4]">
            {isRtl ? "افزودن تصویر" : "Add Image"}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <label className="rounded-xl border border-dashed border-[#444] bg-[#1a1a1a] px-3 py-4 text-center text-sm text-[#888] cursor-pointer hover:border-amber-500/40">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("file", file);
                  const res = await fetch("/api/admin/media/upload", {
                    method: "POST",
                    body: fd,
                  });
                  if (res.ok) {
                    setShowAdd(false);
                    loadMedia();
                  } else {
                    const data = await res.json();
                    setError(data?.error || "Upload failed");
                  }
                }}
              />
              {isRtl ? "آپلود فایل از دستگاه" : "Upload file from device"}
            </label>
            <p className="text-[11px] text-[#666] text-center">{isRtl ? "یا با URL" : "or paste URL"}</p>
            <input
              value={form.file_url}
              onChange={(e) => setForm({ ...form, file_url: e.target.value })}
              placeholder="https://.../image.jpg"
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
              dir="ltr"
            />
            <input
              value={form.file_name}
              onChange={(e) => setForm({ ...form, file_name: e.target.value })}
              placeholder={isRtl ? "نام فایل" : "File name"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
            <input
              value={form.alt_text}
              onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
              placeholder={isRtl ? "متن جایگزین" : "Alt text"}
              className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={addMedia}
            disabled={!form.file_url || !form.file_name}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40"
          >
            {isRtl ? "افزودن" : "Add"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {media.map((item) => (
          <div key={item.id} className="group rounded-2xl overflow-hidden bg-[#141414] border border-[#1e1e1e]">
            <div className="relative aspect-square bg-[#0f0f0f]">
              <img
                src={item.file_url}
                alt={item.alt_text ?? item.file_name}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => copyUrl(item.file_url)}
                className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-semibold text-[#faf5e4] backdrop-blur"
              >
                {copied === item.file_url ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {isRtl ? (copied === item.file_url ? "کپی شد" : "کپی") : copied === item.file_url ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="p-3">
              <p className="flex items-center gap-1 text-xs text-[#ccc] truncate">
                <Link2 size={11} className="shrink-0 text-[#666]" />
                {item.file_name}
              </p>
              <p className="mt-1 text-[10px] text-[#666]">
                {new Date(item.created_at).toLocaleDateString(isRtl ? "fa-IR" : "en-US")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {media.length === 0 && (
        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-10 text-center text-sm text-[#888]">
          {isRtl ? "تصویری ثبت نشده است" : "No media yet"}
        </div>
      )}
    </div>
  );
}