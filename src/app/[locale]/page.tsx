"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Utensils, Sparkles, Clock, MapPin, Phone } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { RestaurantStatus } from "@/components/restaurant/restaurant-status";
import { useMenuContext } from "@/lib/providers/data-provider";
import { CmsBlocks } from "@/components/cms/cms-blocks";
import type { Locale, PageBlock } from "@/lib/types";

export default function HomePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { categories, menuItems, restaurant } = useMenuContext();
  const [cmsBlocks, setCmsBlocks] = useState<PageBlock[] | null>(null);
  const [cmsChecked, setCmsChecked] = useState(false);

  const table = searchParams.get("table");

  useEffect(() => {
    if (table) {
      router.replace(`/${locale}/menu?table=${table}`);
    }
  }, [table, locale, router]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pages?slug=home")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.enabled && data.page && (data.blocks?.length ?? 0) > 0) {
          setCmsBlocks(data.blocks);
        } else {
          setCmsBlocks(null);
        }
      })
      .catch(() => {
        if (!cancelled) setCmsBlocks(null);
      })
      .finally(() => {
        if (!cancelled) setCmsChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (table) return null;

  if (!cmsChecked) {
    return <div className="min-h-screen" />;
  }

  if (cmsBlocks) {
    return (
      <div className="min-h-screen">
        <CmsBlocks blocks={cmsBlocks} locale={locale} />
      </div>
    );
  }

  const bestseller = menuItems.find((i) => i.isBestseller && i.isChefPick);
  const popularCategories = categories.slice(1, 5);
  const chefPicks = menuItems.filter((i) => i.isChefPick).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-5xl mb-6"
          >
            ✨
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-3">
            <span className="text-[#faf5e4]">CHASHNI</span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-amber-400 mb-4" style={{ fontFamily: "Vazirmatn" }}>
            چاشنی
          </p>
          <p className="text-lg md:text-xl text-[#888] mb-2">
            {isRtl ? restaurant.sloganFa : restaurant.sloganEn}
          </p>
          <p className="text-sm text-[#555] max-w-md mx-auto mb-10">
            {isRtl
              ? "urgerهای خاص، پیتزای ایتالیایی، مرغ‌های سوخاری و نوشیدنی‌های دست‌ساز"
              : "Special burgers, Italian pizzas, crispy chicken & handmade drinks"}
          </p>

          <div className="flex items-center justify-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/${locale}/menu`)}
              className="flex items-center gap-2 rounded-xl bg-amber-500 text-black px-8 py-3.5 font-bold text-sm hover:bg-amber-400 transition-colors"
            >
              <Utensils size={18} />
              {isRtl ? "مشاهده منو" : "View Menu"}
              {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/${locale}/build-burger`)}
              className="flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#333] text-[#ccc] px-6 py-3.5 font-bold text-sm hover:border-[#555] transition-colors"
            >
              <Sparkles size={16} />
              {isRtl ? "برگر بساز" : "Build Burger"}
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Status */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-4xl flex justify-center">
          <RestaurantStatus locale={locale} isOpen={true} />
        </div>
      </section>

      {/* Today's Special */}
      {bestseller && (
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">⭐</span>
              <h2 className="text-xl font-bold text-[#faf5e4]">
                {isRtl ? "پیشنهاد ویژه امروز" : "Today's Special"}
              </h2>
            </div>

            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/${locale}/menu`)}
              className="relative rounded-3xl overflow-hidden bg-[#141414] border border-[#1e1e1e] cursor-pointer group"
            >
              <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                <img
                  src={bestseller.image}
                  alt={isRtl ? bestseller.nameFa : bestseller.nameEn}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="inline-block rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400 mb-3">
                  {isRtl ? "ویژه سرآشپز" : "Chef's Pick"}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {isRtl ? bestseller.nameFa : bestseller.nameEn}
                </h3>
                <p className="text-sm text-[#ccc] max-w-lg mb-3 line-clamp-2">
                  {isRtl ? bestseller.descFa : bestseller.descEn}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-amber-400">
                    {formatPrice(bestseller.basePrice, locale)}
                  </span>
                  <span className="text-xs text-[#888]">
                    ⭐ {bestseller.rating} ({bestseller.reviewCount} {isRtl ? "نظر" : "reviews"})
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Popular Categories */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl font-bold text-[#faf5e4] mb-6">
            {isRtl ? "دسته‌بندی‌های محبوب" : "Popular Categories"}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularCategories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/${locale}/menu`)}
                className="flex flex-col items-center gap-3 rounded-2xl bg-[#141414] border border-[#1e1e1e] p-6 hover:border-amber-500/30 transition-all group"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-semibold text-[#ccc]">
                  {isRtl ? cat.nameFa : cat.nameEn}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Chef's Picks */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">👨‍🍳</span>
            <h2 className="text-xl font-bold text-[#faf5e4]">
              {isRtl ? "انتخاب سرآشپز" : "Chef's Picks"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chefPicks.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/${locale}/menu`)}
                className="rounded-2xl bg-[#141414] border border-[#1e1e1e] overflow-hidden text-left hover:border-[#333] transition-all group"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={isRtl ? item.nameFa : item.nameEn}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-[#faf5e4] mb-1">
                    {isRtl ? item.nameFa : item.nameEn}
                  </h3>
                  <p className="text-xs text-[#666] line-clamp-2 mb-2">
                    {isRtl ? item.descFa : item.descEn}
                  </p>
                  <span className="text-sm font-bold text-amber-400">
                    {formatPrice(item.basePrice, locale)}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-[#141414] border border-[#1e1e1e] p-8 md:p-12">
            <h2 className="text-2xl font-bold text-[#faf5e4] mb-4">
              {isRtl ? "داستان چاشنی" : "The CHASHNI Story"}
            </h2>
            <p className="text-sm text-[#888] leading-relaxed mb-6">
              {isRtl
                ? "چاشنی از عشق به غذاهای خوشمزه و باکیفیت شروع شد. ما باور داریم که هر وعده غذا باید یک تجربه خاص باشه. از مواد اولیه تازه و مرغوب استفاده می‌کنیم و هر غذا رو با دقت و عشق آماده می‌کنیم."
                : "CHASHNI started from a love for delicious, quality food. We believe every meal should be a special experience. We use fresh, premium ingredients and prepare every dish with care and passion."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Clock size={18} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#ccc]">
                    {isRtl ? "ساعات کاری" : "Opening Hours"}
                  </p>
                  <p className="text-xs text-[#666]">
                    {restaurant.hours.open} – {restaurant.hours.close}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <MapPin size={18} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#ccc]">
                    {isRtl ? "آدرس" : "Address"}
                  </p>
                  <p className="text-xs text-[#666]">
                    {isRtl ? restaurant.addressFa : restaurant.addressEn}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Phone size={18} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#ccc]">
                    {isRtl ? "تلفن" : "Phone"}
                  </p>
                  <p className="text-xs text-[#666]" dir="ltr">{restaurant.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
