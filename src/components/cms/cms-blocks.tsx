"use client";

import type { Locale, PageBlock } from "@/lib/types";
import Link from "next/link";

export function CmsBlocks({
  blocks,
  locale,
}: {
  blocks: PageBlock[];
  locale: Locale;
}) {
  const isRtl = locale === "fa";

  return (
    <div className="space-y-0">
      {blocks.map((block) => {
        const c = block.content || {};
        switch (block.type) {
          case "hero": {
            const title = (isRtl ? c.title_fa : c.title_en) || c.title || "";
            const subtitle = (isRtl ? c.subtitle_fa : c.subtitle_en) || c.subtitle || "";
            const cta = (isRtl ? c.cta_fa : c.cta_en) || c.cta || (isRtl ? "مشاهده منو" : "View menu");
            return (
              <section
                key={block.id}
                className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent" />
                <h1 className="relative z-10 text-4xl font-black text-[#faf5e4] sm:text-6xl">
                  {String(title)}
                </h1>
                {subtitle ? (
                  <p className="relative z-10 mt-4 max-w-lg text-[#999]">{String(subtitle)}</p>
                ) : null}
                <Link
                  href={`/${locale}/menu`}
                  className="relative z-10 mt-8 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-black"
                >
                  {String(cta)}
                </Link>
              </section>
            );
          }
          case "text": {
            const body = (isRtl ? c.body_fa : c.body_en) || c.body || "";
            return (
              <section key={block.id} className="mx-auto max-w-2xl px-6 py-12">
                <p className="whitespace-pre-wrap text-[#ccc] leading-relaxed">{String(body)}</p>
              </section>
            );
          }
          case "cta": {
            const label = (isRtl ? c.label_fa : c.label_en) || c.label || "CTA";
            const href = String(c.href || `/${locale}/menu`);
            return (
              <section key={block.id} className="px-6 py-10 text-center">
                <Link
                  href={href}
                  className="inline-block rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-black"
                >
                  {String(label)}
                </Link>
              </section>
            );
          }
          case "image": {
            const src = String(c.src || c.url || "");
            if (!src) return null;
            return (
              <section key={block.id} className="px-6 py-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={String(c.alt || "")}
                  className="mx-auto max-h-[480px] w-full max-w-4xl rounded-2xl object-cover"
                />
              </section>
            );
          }
          default:
            return (
              <section key={block.id} className="px-6 py-6 text-center text-xs text-[#555]">
                {block.type}
              </section>
            );
        }
      })}
    </div>
  );
}
