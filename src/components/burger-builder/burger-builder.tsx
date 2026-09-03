"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
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

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

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

  const handleSelect = useCallback((catId: string, optId: string, isMultiple: boolean) => {
    setSelections((prev) => {
      const current = prev[catId] || [];
      if (isMultiple) {
        if (current.includes(optId)) {
          return { ...prev, [catId]: current.filter((id) => id !== optId) };
        }
        return { ...prev, [catId]: [...current, optId] };
      }
      return { ...prev, [catId]: [optId] };
    });
  }, []);

  const canProceed = useMemo(() => {
    const current = selections[step.id] || [];
    return current.length > 0;
  }, [selections, step]);

  const handleComplete = useCallback(() => {
    addItem({
      menuItemId: "custom-burger",
      quantity: 1,
      selectedOptions: {},
      selectedExtras: [],
      customBurger: {
        name: burgerName || undefined,
        bun: (selections["bun"] || [])[0] || "",
        patty: (selections["patty"] || [])[0] || "",
        cheese: (selections["cheese"] || [])[0] || "",
        toppings: selections["toppings"] || [],
        sauce: (selections["sauce"] || [])[0] || "",
      },
    });
    onComplete?.();
  }, [selections, burgerName, addItem, onComplete]);

  const findOption = (catId: string, optId: string): BurgerOption | undefined => {
    const cat = steps.find((s) => s.id === catId);
    return cat?.options.find((o) => o.id === optId);
  };

  return (
    <div className={cn("max-w-lg mx-auto", className)}>
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

      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-[#faf5e4]">
          {locale === "fa" ? step.nameFa : step.nameEn}
        </h3>
        <p className="text-xs text-[#666] mt-1">
          {locale === "fa" ? `مرحله ${currentStep + 1} از ${steps.length}` : `Step ${currentStep + 1} of ${steps.length}`}
        </p>
      </div>

      <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 mb-4">
        <div className="flex items-center justify-center gap-1 py-4">
          {steps.map((s, i) => {
            const selected = (selections[s.id] || [])[0];
            const opt = selected ? findOption(s.id, selected) : null;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-16 h-6 rounded-t-full transition-colors",
                    i === 0
                      ? "bg-amber-600/40 rounded-t-full"
                      : opt
                        ? "bg-amber-500/30"
                        : "bg-[#252525]"
                  )}
                />
                <span className="text-[9px] text-[#555]">
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
                onClick={() => handleSelect(step.id, opt.id, false)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl p-4 text-sm transition-all border",
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-[#141414] border-[#1e1e1e] text-[#ccc] hover:border-[#333]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                      isSelected ? "border-amber-400 bg-amber-400" : "border-[#444]"
                    )}
                  >
                    {isSelected && <Check size={12} className="text-black" />}
                  </div>
                  <span>{locale === "fa" ? opt.nameFa : opt.nameEn}</span>
                </div>
                <div className="text-xs text-[#666]">
                  {opt.calories} cal
                  {opt.price > 0 && (
                    <span className="mr-2 text-amber-400/70">+{formatPrice(opt.price, locale)}</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between text-xs text-[#666] mb-6">
        <span>{totalCalories} {locale === "fa" ? "کالری" : "calories"}</span>
        <span className="font-semibold text-amber-400">{formatPrice(totalPrice, locale)}</span>
      </div>

      {isLast && (
        <div className="mb-6">
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
            {locale === "fa" ? "افزودن به سبد" : "Add to Cart"}
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
