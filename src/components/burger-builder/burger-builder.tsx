"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, ShoppingBag, Flame, DollarSign } from "lucide-react";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { useCartContext } from "@/lib/providers/cart-provider";
import { burgerOptions } from "@/lib/data";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { BurgerCategory, BurgerOption } from "@/lib/types";

interface BurgerBuilderProps {
  className?: string;
  onComplete?: () => void;
}

const steps = burgerOptions;

export function BurgerBuilder({ className, onComplete }: BurgerBuilderProps) {
  const { locale } = useLocaleContext();
  const { addItem } = useCartContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [burgerName, setBurgerName] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const isMultiSelect = step.id === "cheese" || step.id === "toppings" || step.id === "sauce";

  const totalPrice = useMemo(() => {
    let price = 0;
    for (const [catId, optIds] of Object.entries(selections)) {
      const cat = steps.find((s) => s.id === catId);
      if (!cat) continue;
      for (const optId of optIds) {
        const opt = cat.options.find((o) => o.id === optId);
        if (opt) price += opt.price;
      }
    }
    return price;
  }, [selections]);

  const totalCalories = useMemo(() => {
    let cal = 0;
    for (const [catId, optIds] of Object.entries(selections)) {
      const cat = steps.find((s) => s.id === catId);
      if (!cat) continue;
      for (const optId of optIds) {
        const opt = cat.options.find((o) => o.id === optId);
        if (opt) cal += opt.calories;
      }
    }
    return cal;
  }, [selections]);

  const handleSelect = useCallback((catId: string, optId: string) => {
    setSelections((prev) => {
      const current = prev[catId] || [];
      if (isMultiSelect) {
        if (current.includes(optId)) {
          return { ...prev, [catId]: current.filter((id) => id !== optId) };
        }
        return { ...prev, [catId]: [...current, optId] };
      }
      if (current.includes(optId)) {
        return { ...prev, [catId]: [] };
      }
      return { ...prev, [catId]: [optId] };
    });
  }, [isMultiSelect]);

  const canProceed = useMemo(() => {
    const current = selections[step.id] || [];
    return current.length > 0;
  }, [selections, step]);

  const handleComplete = useCallback(() => {
    setIsComplete(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    addItem({
      menuItemId: "custom-burger",
      quantity: 1,
      selectedOptions: {},
      selectedExtras: [],
      customBurger: {
        name: burgerName || undefined,
        bun: (selections["bun"] || [])[0] || "",
        patty: (selections["patty"] || [])[0] || "",
        cheese: selections["cheese"] || [],
        toppings: selections["toppings"] || [],
        sauce: selections["sauce"] || [],
      },
    });
    onComplete?.();
  }, [selections, burgerName, addItem, onComplete]);

  const findOption = (catId: string, optId: string): BurgerOption | undefined => {
    const cat = steps.find((s) => s.id === catId);
    return cat?.options.find((o) => o.id === optId);
  };

  const getSelectedNames = (catId: string): string[] => {
    const opts = selections[catId] || [];
    return opts.map((id) => {
      const opt = findOption(catId, id);
      return opt ? (locale === "fa" ? opt.nameFa : opt.nameEn) : "";
    }).filter(Boolean);
  };

  if (isComplete) {
    return (
      <div className={cn("max-w-lg mx-auto", className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-6 text-center"
        >
          <span className="text-5xl block mb-4">🍔</span>
          <h3 className="text-xl font-black text-[#faf5e4] mb-1">
            {burgerName || (locale === "fa" ? "برگر سفارشی من" : "My Custom Burger")}
          </h3>

          <div className="flex items-center justify-center gap-6 my-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                <Flame size={18} />
                <span className="text-2xl font-black">{totalCalories}</span>
              </div>
              <span className="text-[10px] text-[#666] uppercase tracking-wider">
                {locale === "fa" ? "کالری" : "Calories"}
              </span>
            </div>
            <div className="h-10 w-px bg-[#333]" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                <span className="text-2xl font-black">{formatPrice(totalPrice, locale)}</span>
              </div>
              <span className="text-[10px] text-[#666] uppercase tracking-wider">
                {locale === "fa" ? "قیمت" : "Price"}
              </span>
            </div>
          </div>

          <div className="text-right space-y-2 mb-6">
            {steps.map((s) => {
              const names = getSelectedNames(s.id);
              if (names.length === 0) return null;
              return (
                <div key={s.id} className="flex items-start gap-2 text-sm">
                  <span className="text-[#555] shrink-0 w-16">
                    {locale === "fa" ? s.nameFa : s.nameEn}:
                  </span>
                  <span className="text-[#ccc]">{names.join(", ")}</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsComplete(false)}
              className="flex-1"
            >
              {locale === "fa" ? "ویرایش" : "Edit"}
            </Button>
            <Button
              variant="primary"
              onClick={handleAddToCart}
              icon={<ShoppingBag size={16} />}
              className="flex-1"
            >
              {locale === "fa" ? "افزودن به سبد" : "Add to Cart"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("max-w-lg mx-auto px-2 sm:px-0", className)}>
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "flex-1 h-1 rounded-full transition-colors",
              i <= currentStep ? "bg-amber-400" : "bg-[#252525]"
            )}
          />
        ))}
      </div>

      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-[#faf5e4]">
          {locale === "fa" ? step.nameFa : step.nameEn}
        </h3>
        <p className="text-xs text-[#666] mt-1">
          {locale === "fa"
            ? `مرحله ${currentStep + 1} از ${steps.length}${isMultiSelect ? " — چند انتخابی" : ""}`
            : `Step ${currentStep + 1} of ${steps.length}${isMultiSelect ? " — multi-select" : ""}`
          }
        </p>
      </div>

      {/* Burger visual preview */}
      <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 mb-4">
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 py-3 overflow-x-auto">
          {steps.map((s, i) => {
            const selectedOpts = selections[s.id] || [];
            const hasSelection = selectedOpts.length > 0;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1 min-w-0">
                <div
                  className={cn(
                    "w-10 sm:w-16 h-5 sm:h-6 rounded-t-full transition-colors",
                    i === 0
                      ? "bg-amber-600/40 rounded-t-full"
                      : hasSelection
                        ? "bg-amber-500/30"
                        : "bg-[#252525]"
                  )}
                />
                <span className="text-[8px] sm:text-[9px] text-[#555] truncate max-w-[40px] sm:max-w-none">
                  {locale === "fa" ? s.nameFa : s.nameEn}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: locale === "fa" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: locale === "fa" ? 20 : -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-2 mb-6"
        >
          {step.options.map((opt) => {
            const isSelected = (selections[step.id] || []).includes(opt.id);
            return (
              <motion.button
                key={opt.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(step.id, opt.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl p-3 sm:p-4 text-sm transition-all border",
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-[#141414] border-[#1e1e1e] text-[#ccc] hover:border-[#333]"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 transition-all",
                      isSelected ? "border-amber-400 bg-amber-400" : "border-[#444]"
                    )}
                  >
                    {isSelected && <Check size={12} className="text-black" />}
                  </div>
                  <span className="truncate">{locale === "fa" ? opt.nameFa : opt.nameEn}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[11px] text-[#555] tabular-nums">{opt.calories} cal</span>
                  {opt.price > 0 && (
                    <span className="text-[11px] text-amber-400/70 tabular-nums">
                      +{formatPrice(opt.price, locale)}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Total calories & price */}
      <div className="flex items-center justify-between px-1 mb-6">
        <div className="flex items-center gap-1.5 text-xs text-[#666]">
          <Flame size={14} className="text-amber-500/60" />
          <span className="tabular-nums">{totalCalories} {locale === "fa" ? "کالری" : "cal"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
          <span className="tabular-nums">{formatPrice(totalPrice, locale)}</span>
        </div>
      </div>

      {isLast && (
        <div className="mb-4">
          <input
            value={burgerName}
            onChange={(e) => setBurgerName(e.target.value)}
            placeholder={locale === "fa" ? "به برگرت یه اسم بده..." : "Name your burger..."}
            className="w-full rounded-xl bg-[#141414] border border-[#1e1e1e] px-4 py-3 text-sm text-[#ccc] placeholder-[#555] focus:outline-none focus:border-amber-500/40"
          />
        </div>
      )}

      <div className="flex gap-3">
        {!isFirst && (
          <Button
            variant="secondary"
            onClick={() => setCurrentStep((p) => p - 1)}
            icon={locale === "fa" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            iconPosition={locale === "fa" ? "right" : "left"}
            className="flex-1"
          >
            {locale === "fa" ? "قبلی" : "Back"}
          </Button>
        )}

        {isLast ? (
          <Button
            variant="primary"
            onClick={handleComplete}
            disabled={!canProceed}
            icon={<ShoppingBag size={16} />}
            className="flex-1"
          >
            {locale === "fa" ? "مشاهده خلاصه" : "View Summary"}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => setCurrentStep((p) => p + 1)}
            disabled={!canProceed}
            icon={locale === "fa" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            iconPosition={locale === "fa" ? "left" : "right"}
            className="flex-1"
          >
            {locale === "fa" ? "بعدی" : "Next"}
          </Button>
        )}
      </div>
    </div>
  );
}
