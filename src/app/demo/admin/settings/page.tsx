"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Check } from "lucide-react";
import type { RestaurantSettings } from "@/lib/types";
import { restaurant } from "@/lib/data";

const STORAGE_KEY = "chashni-settings";

const emojiOptions = ["🍔", "🍕", "🍟", "🍗", "🍰", "🥤", "🔥", "😋"];

const defaultSettings: RestaurantSettings = {
  nameFa: restaurant.nameFa,
  nameEn: restaurant.nameEn,
  sloganFa: restaurant.sloganFa,
  sloganEn: restaurant.sloganEn,
  addressFa: restaurant.addressFa,
  addressEn: restaurant.addressEn,
  phone: restaurant.phone,
  hours: { ...restaurant.hours },
  designerName: "",
  designerUrl: "",
  logoEmoji: "🍔",
};

function loadSettings(): RestaurantSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<RestaurantSettings>;
    return {
      ...defaultSettings,
      ...parsed,
      hours: { ...defaultSettings.hours, ...(parsed.hours ?? {}) },
    };
  } catch {
    return defaultSettings;
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>(() =>
    loadSettings()
  );
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof RestaurantSettings>(
    key: K,
    value: RestaurantSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaved(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#222] bg-[#141414] px-4 py-3 text-sm text-[#ccc] placeholder-[#555] focus:border-amber-500/40 focus:outline-none";

  const labelClass = "mb-1.5 block text-xs font-semibold text-[#888]";

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[#888]">Restaurant information and branding</p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-5 rounded-2xl border border-[#1e1e1e] bg-[#141414] p-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Restaurant Name (English)</label>
            <input
              className={inputClass}
              value={settings.nameEn}
              onChange={(e) => update("nameEn", e.target.value)}
              placeholder="CHASHNI"
            />
          </div>
          <div>
            <label className={labelClass}>Restaurant Name (Persian)</label>
            <input
              className={inputClass}
              value={settings.nameFa}
              onChange={(e) => update("nameFa", e.target.value)}
              placeholder="چاشنی"
            />
          </div>

          <div>
            <label className={labelClass}>Slogan (English)</label>
            <input
              className={inputClass}
              value={settings.sloganEn}
              onChange={(e) => update("sloganEn", e.target.value)}
              placeholder="A Taste You Won't Forget"
            />
          </div>
          <div>
            <label className={labelClass}>Slogan (Persian)</label>
            <input
              className={inputClass}
              value={settings.sloganFa}
              onChange={(e) => update("sloganFa", e.target.value)}
              placeholder="طعمی که فراموشش نمی‌کنی"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Address (English)</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={settings.addressEn}
              onChange={(e) => update("addressEn", e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Address (Persian)</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={settings.addressFa}
              onChange={(e) => update("addressFa", e.target.value)}
              placeholder="آدرس"
            />
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              value={settings.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="021-88881234"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Open</label>
              <input
                type="time"
                className={inputClass}
                value={settings.hours.open}
                onChange={(e) =>
                  update("hours", { ...settings.hours, open: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Close</label>
              <input
                type="time"
                className={inputClass}
                value={settings.hours.close}
                onChange={(e) =>
                  update("hours", { ...settings.hours, close: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 rounded-2xl border border-[#1e1e1e] bg-[#141414] p-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Designer Name</label>
            <input
              className={inputClass}
              value={settings.designerName}
              onChange={(e) => update("designerName", e.target.value)}
              placeholder="Designer"
            />
          </div>
          <div>
            <label className={labelClass}>Designer URL</label>
            <input
              className={inputClass}
              value={settings.designerUrl}
              onChange={(e) => update("designerUrl", e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Logo Emoji</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => update("logoEmoji", emoji)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xl transition-colors ${
                    settings.logoEmoji === emoji
                      ? "border-amber-500/60 bg-amber-500/15"
                      : "border-[#222] bg-[#0a0a0a] hover:border-[#444]"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <motion.span
            animate={{ opacity: saved ? 1 : 0 }}
            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400"
          >
            <Check size={16} /> Saved
          </motion.span>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-amber-400"
          >
            <Save size={16} /> Save Settings
          </button>
        </div>
      </motion.section>
    </div>
  );
}
