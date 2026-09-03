"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Flame, Leaf, AlertTriangle, Check } from "lucide-react";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { useCartContext } from "@/lib/providers/cart-provider";
import { cn, formatPrice, getSpicyLabel } from "@/lib/utils";
import { Rating } from "@/components/ui/rating";
import { QuantityControl } from "@/components/ui/quantity-control";
import type { MenuItem, CartItem } from "@/lib/types";

interface ProductSheetProps {
  item: MenuItem | null;
  onClose: () => void;
  className?: string;
}

export function ProductSheet({ item, onClose, className }: ProductSheetProps) {
  const { locale } = useLocaleContext();
  const { addItem } = useCartContext();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const resetState = useCallback(() => {
    setQuantity(1);
    setSelectedOptions({});
    setSelectedExtras([]);
    setNote("");
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const toggleOption = useCallback((groupId: string, optionId: string, type: "radio" | "checkbox") => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      if (type === "radio") {
        return { ...prev, [groupId]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      return { ...prev, [groupId]: [...current, optionId] };
    });
  }, []);

  const toggleExtra = useCallback((extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    );
  }, []);

  const calculatedPrice = useMemo(() => {
    if (!item) return 0;
    let price = item.basePrice;
    for (const [groupId, optionIds] of Object.entries(selectedOptions)) {
      const group = item.options.find((g) => g.id === groupId);
      if (!group) continue;
      for (const optId of optionIds) {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) price += opt.priceModifier;
      }
    }
    for (const extraId of selectedExtras) {
      const extra = item.extras.find((e) => e.id === extraId);
      if (extra) price += extra.price;
    }
    return price * quantity;
  }, [item, selectedOptions, selectedExtras, quantity]);

  const calculatedCalories = useMemo(() => {
    if (!item) return 0;
    let cal = item.calories;
    for (const extraId of selectedExtras) {
      const extra = item.extras.find((e) => e.id === extraId);
      if (extra?.calories) cal += extra.calories;
    }
    return cal * quantity;
  }, [item, selectedExtras, quantity]);

  const handleAddToCart = useCallback(() => {
    if (!item) return;
    const cartItem: CartItem = {
      menuItemId: item.id,
      quantity,
      selectedOptions,
      selectedExtras,
      note: note || undefined,
    };
    addItem(cartItem);
    handleClose();
  }, [item, quantity, selectedOptions, selectedExtras, note, addItem, handleClose]);

  if (!item) return null;

  const name = locale === "fa" ? item.nameFa : item.nameEn;
  const desc = locale === "fa" ? item.descFa : item.descEn;
  const ingredients = locale === "fa" ? item.ingredientsFa : item.ingredients;
  const allergens = locale === "fa" ? item.allergensFa : item.allergens;

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-[70] max-h-[90vh] overflow-y-auto",
              "rounded-t-3xl bg-[#0a0a0a] border-t border-[#222]",
              className
            )}
          >
            <div className="relative">
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              </div>

              <button
                onClick={handleClose}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 pb-32">
              <h2 className="text-xl font-bold text-[#faf5e4] mt-1">{name}</h2>
              <p className="mt-2 text-sm text-[#888] leading-relaxed">{desc}</p>

              <div className="mt-3 flex items-center gap-4">
                <Rating rating={item.rating} reviewCount={item.reviewCount} size="md" />
                <span className="flex items-center gap-1 text-xs text-[#666]">
                  <Clock size={12} />
                  {item.preparationTime} {locale === "fa" ? "دقیقه" : "min"}
                </span>
                {item.spicyLevel > 0 && (
                  <span className="flex items-center gap-1 text-xs text-[#666]">
                    <Flame size={12} className="text-red-400" />
                    {getSpicyLabel(item.spicyLevel, locale)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full bg-[#1e1e1e] border border-[#333] px-3 py-1 text-xs text-[#aaa]"
                  >
                    {ing}
                  </span>
                ))}
              </div>

              {allergens.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-500/80">
                  <AlertTriangle size={12} />
                  <span>{locale === "fa" ? "آلرژن‌ها:" : "Allergens:"} {allergens.join(", ")}</span>
                </div>
              )}

              {item.options.map((group) => (
                <div key={group.id} className="mt-6">
                  <h4 className="text-sm font-semibold text-[#faf5e4] mb-3">
                    {locale === "fa" ? group.nameFa : group.nameEn}
                    {group.required && (
                      <span className="text-xs text-amber-400 mr-2">
                        ({locale === "fa" ? "اجباری" : "Required"})
                      </span>
                    )}
                  </h4>
                  <div className="space-y-2">
                    {group.options.map((opt) => {
                      const isSelected = (selectedOptions[group.id] || []).includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleOption(group.id, opt.id, group.type)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl p-3 text-sm transition-all",
                            isSelected
                              ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                              : "bg-[#141414] border border-[#1e1e1e] text-[#ccc] hover:border-[#333]"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                                isSelected
                                  ? "border-amber-400 bg-amber-400"
                                  : "border-[#444]"
                              )}
                            >
                              {isSelected && <Check size={12} className="text-black" />}
                            </div>
                            <span>{locale === "fa" ? opt.nameFa : opt.nameEn}</span>
                          </div>
                          {opt.priceModifier !== 0 && (
                            <span className="text-xs text-[#888]">
                              {opt.priceModifier > 0 ? "+" : ""} {formatPrice(opt.priceModifier, locale)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {item.extras.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-[#faf5e4] mb-3">
                    {locale === "fa" ? "اضافات" : "Extras"}
                  </h4>
                  <div className="space-y-2">
                    {item.extras.map((extra) => {
                      const isSelected = selectedExtras.includes(extra.id);
                      return (
                        <button
                          key={extra.id}
                          onClick={() => toggleExtra(extra.id)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl p-3 text-sm transition-all",
                            isSelected
                              ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                              : "bg-[#141414] border border-[#1e1e1e] text-[#ccc] hover:border-[#333]"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all",
                                isSelected
                                  ? "border-amber-400 bg-amber-400"
                                  : "border-[#444]"
                              )}
                            >
                              {isSelected && <Check size={12} className="text-black" />}
                            </div>
                            <span>{locale === "fa" ? extra.nameFa : extra.nameEn}</span>
                          </div>
                          <span className="text-xs text-[#888]">
                            {extra.price > 0 ? `+ ${formatPrice(extra.price, locale)}` : (locale === "fa" ? "رایگان" : "Free")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-[#faf5e4] mb-2">
                  {locale === "fa" ? "توضیحات" : "Special Notes"}
                </h4>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={locale === "fa" ? "مثلاً بدون پیاز..." : "e.g. no onions..."}
                  className="w-full rounded-xl bg-[#141414] border border-[#1e1e1e] px-4 py-3 text-sm text-[#ccc] placeholder-[#555] focus:outline-none focus:border-amber-500/40 resize-none h-20"
                />
              </div>

              <div className="mt-6 flex items-center justify-between text-sm text-[#888]">
                <span>{calculatedCalories} {locale === "fa" ? "کالری" : "calories"}</span>
              </div>
            </div>

            <div className="fixed bottom-0 inset-x-0 z-[80] bg-[#0a0a0a] border-t border-[#222] p-4">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                <QuantityControl value={quantity} onChange={setQuantity} />

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-amber-500 to-orange-600 py-4 text-sm font-bold text-black shadow-lg shadow-amber-500/20"
                >
                  {locale === "fa" ? "افزودن به سبد" : "Add to Cart"} — {formatPrice(calculatedPrice, locale)}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
