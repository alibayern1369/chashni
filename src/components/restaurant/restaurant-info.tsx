"use client";

import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { useMenuContext } from "@/lib/providers/data-provider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface RestaurantInfoProps {
  locale?: Locale;
  className?: string;
}

export function RestaurantInfo({ locale = "fa", className }: RestaurantInfoProps) {
  const { restaurant } = useMenuContext();
  return (
    <div className={cn("rounded-2xl bg-[#141414] border border-[#1e1e1e] p-5 space-y-4", className)}>
      <div>
        <h3 className="text-base font-bold text-[#faf5e4]">
          {locale === "fa" ? restaurant.nameFa : restaurant.nameEn}
        </h3>
        <p className="text-sm text-[#888] mt-1">
          {locale === "fa" ? restaurant.sloganFa : restaurant.sloganEn}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[#ccc]">
              {locale === "fa" ? restaurant.addressFa : restaurant.addressEn}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone size={16} className="text-amber-400 shrink-0" />
          <p className="text-sm text-[#ccc]" dir="ltr">{restaurant.phone}</p>
        </div>

        <div className="flex items-center gap-3">
          <Clock size={16} className="text-amber-400 shrink-0" />
          <p className="text-sm text-[#ccc]">
            {restaurant.hours.open} – {restaurant.hours.close}
          </p>
        </div>
      </div>

      {restaurant.branches.length > 0 && (
        <div className="pt-3 border-t border-[#1e1e1e]">
          <h4 className="text-xs font-semibold text-[#666] uppercase tracking-wider mb-2">
            {locale === "fa" ? "شعبه‌ها" : "Branches"}
          </h4>
          {restaurant.branches.map((branch) => (
            <div key={branch.id} className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#ccc]">
                  {locale === "fa" ? branch.nameFa : branch.nameEn}
                </p>
                <p className="text-xs text-[#888]">
                  {locale === "fa" ? branch.addressFa : branch.addressEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-[#1e1e1e] flex gap-3">
        <a
          href="#"
          className="flex items-center gap-1.5 text-xs text-[#888] hover:text-amber-400 transition-colors"
        >
          Instagram <ExternalLink size={10} />
        </a>
        <a
          href="#"
          className="flex items-center gap-1.5 text-xs text-[#888] hover:text-amber-400 transition-colors"
        >
          Telegram <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
