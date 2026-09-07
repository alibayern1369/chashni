"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, ShoppingBag, Flame } from "lucide-react";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { useCartContext } from "@/lib/providers/cart-provider";
import { useMenuContext } from "@/lib/providers/data-provider";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BurgerVisual, type BurgerVisualState } from "./burger-visual";
import { CUSTOM_BURGER_BASE_PRICE, type BurgerOption } from "@/lib/types";

interface BurgerBuilderProps {
  className?: string;
  onComplete?: () => void;
}

export function BurgerBuilder({ className, onComplete }: BurgerBuilderProps) {
  const { locale } = useLocaleContext();
  const { addItem } = useCartContext();
  const { burgerOptions } = useMenuContext();
  const steps = burgerOptions;
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [burgerName, setBurgerName] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const isMultiSelect =
    step.selectionMode === "multi" ||
    step.id === "cheese" ||
    step.id === "toppings" ||
    step.id === "sauce";

  const visualState: BurgerVisualState = useMemo(
    () => ({
      bun: (selections.bun || [])[0],
      patty: (selections.patty || [])[0],
      cheese: selections.cheese || [],
      toppings: selections.toppings || [],
      sauce: selections.sauce || [],
    }),
    [selections],
  );

  const totalPrice = useMemo(() => {
    let price = CUSTOM_BURGER_BASE_PRICE;
    for (const [catId, optIds] of Object.entries(selections)) {
      const cat = steps.find((s) => s.id === catId);
      if (!cat) continue;
      for (const optId of optIds) {
        const opt = cat.options.find((o) => o.id === optId);
        if (opt) price += opt.price;
      }
    }
    return price;
  }, [selections, steps]);

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
  }, [selections, steps]);

  const handleSelect = useCallback(
    (catId: string, optId: string) => {
      setSelections((prev) => {
        const current = prev[catId] || [];
        const cat = steps.find((s) => s.id === catId);
        const max = cat?.maxSelect ?? 99;
        if (isMultiSelect) {
          if (current.includes(optId)) {
            return { ...prev, [catId]: current.filter((id) => id !== optId) };
          }
          if (current.length >= max) return prev;
          return { ...prev, [catId]: [...current, optId] };
        }
        return { ...prev, [catId]: current.includes(optId) ? [] : [optId] };
      });
    },
    [isMultiSelect, steps],
  );

  const canProceed = useMemo(() => {
    const current = selections[step.id] || [];
    return current.length > 0;
  }, [selections, step]);

  const handleAddToCart = useCallback(() => {
    addItem({
      menuItemId: "custom-burger",
      quantity: 1,
      selectedOptions: {},
      selectedExtras: [],
      customBurger: {
        name: burgerName || undefined,
        bun: (selections.bun || [])[0] || "",
        patty: (selections.patty || [])[0] || "",
        cheese: selections.cheese || [],
        toppings: selections.toppings || [],
        sauce: selections.sauce || [],
      },
    });
    onComplete?.();
  }, [selections, burgerName, addItem, onComplete]);

  const findOption = (catId: string, optId: string): BurgerOption | undefined => {
    const cat = steps.find((s) => s.id === catId);
    return cat?.options.find((o) => o.id === optId);
  };

  const getSelectedNames = (catId: string): string[] => {
    return (selections[catId] || [])
      .map((id) => {
        const opt = findOption(catId, id);
        return opt ? (locale === "fa" ? opt.nameFa : opt.nameEn) : "";
      })
      .filter(Boolean);
  };

  if (isComplete) {
    return (
      <div className={cn("mx-auto max-w-xl", className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-[1.75rem] p-6"
        >
          <BurgerVisual state={visualState} className="mb-5" />
          <h3 className="text-center text-xl font-black text-[var(--color-text)]">
            {burgerName || (locale === "fa" ? "برگر سفارشی نمکدان" : "Namakdan Custom Burger")}
          </h3>

          <div className="my-6 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1 text-[var(--pastel-peach)]">
                <Flame size={18} />
                <span className="text-2xl font-black tabular-nums">{totalCalories}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                {locale === "fa" ? "کالری" : "Calories"}
              </span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
              <div className="mb-1 text-2xl font-black text-[var(--pastel-mint)] tabular-nums">
                {formatPrice(totalPrice, locale)}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                {locale === "fa" ? "قیمت نهایی" : "Total"}
              </span>
            </div>
          </div>

          <div className="mb-6 space-y-2 text-sm">
            <div className="flex justify-between gap-3 text-[var(--color-text-muted)]">
              <span>{locale === "fa" ? "هزینه پایه ساخت" : "Base assembly"}</span>
              <span className="tabular-nums text-[var(--color-text)]">
                {formatPrice(CUSTOM_BURGER_BASE_PRICE, locale)}
              </span>
            </div>
            {steps.map((s) => {
              const names = getSelectedNames(s.id);
              if (!names.length) return null;
              return (
                <div key={s.id} className="flex justify-between gap-3">
                  <span className="text-[var(--color-text-muted)]">
                    {locale === "fa" ? s.nameFa : s.nameEn}
                  </span>
                  <span className="text-right text-[var(--color-text)]">{names.join("، ")}</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsComplete(false)} className="flex-1">
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
    <div className={cn("mx-auto max-w-xl", className)}>
      {/* Progress pills */}
      <div className="mb-5 flex items-center gap-2">
        {steps.map((s, i) => {
          const done = (selections[s.id] || []).length > 0;
          const active = i === currentStep;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentStep(i)}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                active
                  ? "bg-gradient-to-r from-[var(--pastel-mint)] to-[var(--pastel-peach)]"
                  : done
                    ? "bg-[var(--pastel-mint)]/50"
                    : "bg-white/10",
              )}
              aria-label={locale === "fa" ? s.nameFa : s.nameEn}
            />
          );
        })}
      </div>

      <BurgerVisual state={visualState} className="mb-5" />

      <div className="mb-4 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">
            {locale === "fa"
              ? `مرحله ${currentStep + 1} از ${steps.length}`
              : `Step ${currentStep + 1} of ${steps.length}`}
          </p>
          <h3 className="text-xl font-black text-[var(--color-text)]">
            {locale === "fa" ? step.nameFa : step.nameEn}
          </h3>
        </div>
        <div className="text-left text-xs text-[var(--color-text-muted)]">
          <span className="block tabular-nums text-[var(--pastel-mint)]">
            {formatPrice(totalPrice, locale)}
          </span>
          <span className="tabular-nums">
            {totalCalories} {locale === "fa" ? "کالری" : "cal"}
          </span>
        </div>
      </div>

      <p className="mb-3 px-1 text-[11px] text-[var(--color-text-muted)]">
        {locale === "fa"
          ? `پایه ساخت: ${formatPrice(CUSTOM_BURGER_BASE_PRICE, locale)} + انتخاب‌ها`
          : `Base ${formatPrice(CUSTOM_BURGER_BASE_PRICE, locale)} + selections`}
        {isMultiSelect
          ? locale === "fa"
            ? " — می‌تونی چند تا انتخاب کنی"
            : " — multi-select"
          : ""}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="mb-5 space-y-2.5"
        >
          {step.options
            .filter((o) => o.available !== false)
            .map((opt) => {
              const isSelected = (selections[step.id] || []).includes(opt.id);
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleSelect(step.id, opt.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-sm transition-all duration-300",
                    isSelected ? "glass-pastel-mint" : "glass hover:border-white/20",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
                        isSelected
                          ? "border-[var(--pastel-mint)] bg-[var(--pastel-mint)] text-[#0b0d10]"
                          : "border-white/20",
                      )}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>
                    <span className="truncate font-semibold text-[var(--color-text)]">
                      {locale === "fa" ? opt.nameFa : opt.nameEn}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-xs font-bold tabular-nums text-[var(--pastel-peach)]">
                      {formatPrice(opt.price, locale)}
                    </span>
                    <span className="text-[10px] tabular-nums text-[var(--color-text-muted)]">
                      {opt.calories} {locale === "fa" ? "کالری" : "cal"}
                    </span>
                  </div>
                </motion.button>
              );
            })}
        </motion.div>
      </AnimatePresence>

      {isLast && (
        <div className="mb-4">
          <input
            value={burgerName}
            onChange={(e) => setBurgerName(e.target.value)}
            placeholder={locale === "fa" ? "اسم برگرت چی باشه؟" : "Name your burger"}
            className="glass w-full rounded-2xl px-4 py-3.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--pastel-mint)]/40"
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
            onClick={() => setIsComplete(true)}
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
