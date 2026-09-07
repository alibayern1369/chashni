"use client";

import { FOOD_CATEGORY_ICONS, iconEmoji } from "@/lib/admin/food-icons";
import { cn } from "@/lib/utils";

export function CategoryIconPicker({
  value,
  onChange,
  isRtl,
}: {
  value: string;
  onChange: (emoji: string) => void;
  isRtl: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-[#666]">
        {isRtl ? "انتخاب آیکون از کتابخانه" : "Pick an icon"}
      </p>
      <div className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2">
        <span className="text-2xl">{iconEmoji(value)}</span>
        <span className="text-xs text-[#888]">
          {isRtl ? "انتخاب‌شده" : "Selected"}
        </span>
      </div>
      <div className="grid max-h-48 grid-cols-6 gap-1.5 overflow-y-auto rounded-xl border border-[#1e1e1e] bg-[#121212] p-2 sm:grid-cols-8">
        {FOOD_CATEGORY_ICONS.map((icon) => (
          <button
            key={icon.id}
            type="button"
            title={isRtl ? icon.labelFa : icon.labelEn}
            onClick={() => onChange(icon.emoji)}
            className={cn(
              "flex h-10 items-center justify-center rounded-lg text-xl transition-colors",
              value === icon.emoji || value === icon.id
                ? "bg-amber-500/20 ring-1 ring-amber-500/50"
                : "hover:bg-[#1e1e1e]",
            )}
          >
            {icon.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
