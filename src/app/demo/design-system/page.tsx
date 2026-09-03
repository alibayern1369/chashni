"use client";

import { useState } from "react";
import { Star, Plus, Minus, Check, Flame, Leaf, Award, ChefHat, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { menuItems } from "@/lib/data";

const badges = [
  { variant: "bestseller", label: "Bestseller", style: "bg-amber-500/15 text-amber-400 border border-amber-500/20" },
  { variant: "new", label: "New", style: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" },
  { variant: "chefPick", label: "Chef's Pick", style: "bg-purple-500/15 text-purple-400 border border-purple-500/20" },
  { variant: "vegetarian", label: "Vegetarian", style: "bg-green-500/15 text-green-400 border border-green-500/20" },
];

const buttons = [
  { variant: "primary", label: "Primary", className: "bg-amber-500 text-black hover:bg-amber-400 font-bold" },
  { variant: "secondary", label: "Secondary", className: "bg-[#1e1e1e] text-[#ccc] border border-[#333] hover:border-[#555]" },
  { variant: "ghost", label: "Ghost", className: "text-[#888] hover:text-[#ccc] hover:bg-[#1e1e1e]" },
];

export default function DesignSystemPage() {
  const [toggleOn, setToggleOn] = useState(true);
  const [qty, setQty] = useState(2);
  const [toastVisible, setToastVisible] = useState(false);
  const sampleItem = menuItems[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#faf5e4] p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <h1 className="text-3xl font-black tracking-tight mb-1">Design System</h1>
            <p className="text-sm text-[#888]">CHASHNI component and style showcase</p>
          </div>

          {/* Typography */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#ccc] mb-4 border-b border-[#1e1e1e] pb-2">Typography</h2>
            <div className="space-y-4">
              <div>
                <p className="text-4xl font-black text-[#faf5e4] tracking-tight">CHASHNI</p>
                <p className="text-xs text-[#555] mt-1">text-4xl font-black</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#faf5e4]">Heading 2</p>
                <p className="text-xs text-[#555] mt-1">text-2xl font-bold</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#ccc]">Heading 3</p>
                <p className="text-xs text-[#555] mt-1">text-lg font-semibold</p>
              </div>
              <div>
                <p className="text-sm text-[#888]">Body text — The quick brown fox jumps over the lazy dog</p>
                <p className="text-xs text-[#555] mt-1">text-sm text-[#888]</p>
              </div>
              <div>
                <p className="text-sm text-[#888]" style={{ fontFamily: "Vazirmatn" }}>
                  متن فارسی — چاشنی، طعمی که فراموشش نمی‌کنی
                </p>
                <p className="text-xs text-[#555] mt-1">Vazirmatn — Persian text</p>
              </div>
              <div>
                <p className="text-amber-400 text-xl font-bold tabular-nums">۴۸۹,۰۰۰ تومان</p>
                <p className="text-xs text-[#555] mt-1">Price display</p>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#ccc] mb-4 border-b border-[#1e1e1e] pb-2">Buttons</h2>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-[#555] mb-2">Variants</p>
                <div className="flex flex-wrap gap-3">
                  {buttons.map((b) => (
                    <button key={b.variant} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${b.className}`}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-[#555] mb-2">Sizes</p>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="bg-amber-500 text-black rounded-lg px-3 py-1.5 text-xs font-bold">Small</button>
                  <button className="bg-amber-500 text-black rounded-xl px-4 py-2.5 text-sm font-bold">Medium</button>
                  <button className="bg-amber-500 text-black rounded-xl px-6 py-3.5 text-sm font-bold">Large</button>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#555] mb-2">With Icons</p>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-amber-500 text-black rounded-xl px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2">
                    <Plus size={16} /> Add to Cart
                  </button>
                  <button className="bg-[#1e1e1e] text-[#ccc] border border-[#333] rounded-xl px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2 hover:border-[#555]">
                    <Minus size={16} /> Remove
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Badges */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#ccc] mb-4 border-b border-[#1e1e1e] pb-2">Badges</h2>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <span key={b.variant} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${b.style}`}>
                  {b.variant === "bestseller" && <Award size={12} />}
                  {b.variant === "new" && <Sparkles size={12} />}
                  {b.variant === "chefPick" && <ChefHat size={12} />}
                  {b.variant === "vegetarian" && <Leaf size={12} />}
                  {b.label}
                </span>
              ))}
            </div>
          </section>

          {/* Color Palette */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#ccc] mb-4 border-b border-[#1e1e1e] pb-2">Color Palette</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { name: "Background", color: "#0a0a0a" },
                { name: "Surface", color: "#141414" },
                { name: "Surface 2", color: "#1e1e1e" },
                { name: "Surface 3", color: "#252525" },
                { name: "Accent", color: "#f59e0b" },
                { name: "Text", color: "#faf5e4" },
              ].map((c) => (
                <div key={c.name}>
                  <div className="h-16 rounded-xl border border-[#222]" style={{ backgroundColor: c.color }} />
                  <p className="text-[10px] text-[#666] mt-1 text-center">{c.name}</p>
                  <p className="text-[10px] text-[#555] text-center font-mono">{c.color}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cards */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#ccc] mb-4 border-b border-[#1e1e1e] pb-2">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-5">
                <h3 className="text-sm font-bold text-[#ccc] mb-2">Card Title</h3>
                <p className="text-xs text-[#888]">Card body text with description content.</p>
              </div>
              <div className="rounded-2xl bg-[#141414] border border-amber-500/30 p-5">
                <h3 className="text-sm font-bold text-amber-400 mb-2">Highlighted Card</h3>
                <p className="text-xs text-[#888]">This card has an accent border.</p>
              </div>
            </div>
          </section>

          {/* Inputs */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#ccc] mb-4 border-b border-[#1e1e1e] pb-2">Inputs</h2>
            <div className="space-y-3 max-w-md">
              <input
                placeholder="Text input"
                className="w-full rounded-xl bg-[#141414] border border-[#222] px-4 py-3 text-sm text-[#ccc] placeholder-[#555] focus:outline-none focus:border-amber-500/40"
              />
              <textarea
                placeholder="Textarea"
                rows={3}
                className="w-full rounded-xl bg-[#141414] border border-[#222] px-4 py-3 text-sm text-[#ccc] placeholder-[#555] focus:outline-none focus:border-amber-500/40 resize-none"
              />
              <div className="flex gap-2">
                <button className="flex-1 rounded-xl bg-amber-500/10 border border-amber-500/30 py-3 text-sm font-semibold text-amber-400">Active</button>
                <button className="flex-1 rounded-xl bg-[#141414] border border-[#222] py-3 text-sm font-semibold text-[#888]">Inactive</button>
              </div>
            </div>
          </section>

          {/* Rating & Price */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#ccc] mb-4 border-b border-[#1e1e1e] pb-2">Rating & Price</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">4.9</span>
                <span className="text-[10px] text-[#555]">(342)</span>
              </div>
              <div>
                <span className="text-xl font-bold text-amber-400 tabular-nums">۴۸۹,۰۰۰ تومان</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#666]">
                <Flame size={10} className="text-red-400" /> Spicy
                <Leaf size={10} className="text-green-400 ml-2" /> Vegetarian
              </div>
            </div>
          </section>

          {/* Quantity Control */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#ccc] mb-4 border-b border-[#1e1e1e] pb-2">Quantity Control</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => setQty(Math.max(0, qty - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e1e1e] border border-[#333] text-[#888] hover:text-[#ccc] transition-colors">
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-bold text-sm tabular-nums">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </section>

          {/* Skeleton Loading */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#ccc] mb-4 border-b border-[#1e1e1e] pb-2">Skeleton Loading</h2>
            <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] overflow-hidden max-w-xs">
              <div className="aspect-[4/3] bg-[#1a1a1a] animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-[#1e1e1e] rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-[#1e1e1e] rounded w-full animate-pulse" />
                <div className="h-3 bg-[#1e1e1e] rounded w-1/2 animate-pulse" />
              </div>
            </div>
          </section>

          {/* Empty State */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#ccc] mb-4 border-b border-[#1e1e1e] pb-2">Empty State</h2>
            <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e1e1e] border border-[#252525] text-[#555] mx-auto mb-4">
                <ChefHat size={24} />
              </div>
              <p className="text-sm font-semibold text-[#ccc] mb-1">No items found</p>
              <p className="text-xs text-[#666]">Try adjusting your filters</p>
            </div>
          </section>

          {/* Toast Example */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#ccc] mb-4 border-b border-[#1e1e1e] pb-2">Toast</h2>
            <button
              onClick={() => setToastVisible(true)}
              className="bg-amber-500 text-black rounded-xl px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2"
            >
              <Check size={16} /> Show Toast
            </button>
            {toastVisible && (
              <div className="mt-3 inline-flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium bg-emerald-500/15 border-emerald-500/20 text-emerald-400">
                <Check size={16} />
                <span>Item added to cart!</span>
                <button onClick={() => setToastVisible(false)} className="text-current opacity-60 hover:opacity-100">
                  <X size={14} />
                </button>
              </div>
            )}
          </section>

          {/* Product Card Example */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#ccc] mb-4 border-b border-[#1e1e1e] pb-2">Product Card</h2>
            {sampleItem && (
              <div className="max-w-xs rounded-2xl bg-[#141414] border border-[#1e1e1e] overflow-hidden">
                <div className="relative aspect-[4/3] bg-[#1a1a1a]">
                  <img src={sampleItem.image} alt="" className="h-full w-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">⭐ Bestseller</span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="text-sm font-semibold text-[#faf5e4]">{sampleItem.nameFa}</h3>
                  <p className="text-xs text-[#888] line-clamp-2">{sampleItem.descFa}</p>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-semibold text-amber-400">{sampleItem.rating}</span>
                    <span className="text-[9px] text-[#555]">({sampleItem.reviewCount})</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#1e1e1e]">
                    <span className="text-sm font-bold text-amber-400 tabular-nums">
                      {sampleItem.basePrice.toLocaleString("fa-IR")} تومان
                    </span>
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-colors">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
    </div>
  );
}
