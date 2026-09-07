"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BurgerVisualState {
  bun?: string;
  patty?: string;
  cheese: string[];
  toppings: string[];
  sauce: string[];
}

interface BurgerVisualProps {
  state: BurgerVisualState;
  className?: string;
}

const bunTone: Record<string, string> = {
  "bun-brioche": "#E8B86D",
  "bun-pretzel": "#C47A3A",
  "bun-sesame": "#D4A017",
  "bun-whole-wheat": "#B8956A",
};

const pattyTone: Record<string, string> = {
  "patty-single": "#6B3A2A",
  "patty-double": "#5A2E22",
  "patty-chicken": "#E8C4A0",
  "patty-plant": "#7A9B6A",
};

function Layer({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -28, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 22, delay }}
      className={cn("relative mx-auto", className)}
    >
      {children}
    </motion.div>
  );
}

export function BurgerVisual({ state, className }: BurgerVisualProps) {
  const hasBun = Boolean(state.bun);
  const hasPatty = Boolean(state.patty);
  const hasCheese = state.cheese.length > 0;
  const hasToppings = state.toppings.length > 0;
  const hasSauce = state.sauce.length > 0;
  const isDouble = state.patty === "patty-double";
  const empty = !hasBun && !hasPatty && !hasCheese && !hasToppings && !hasSauce;

  return (
    <div
      className={cn(
        "relative flex min-h-[280px] items-end justify-center overflow-hidden rounded-[1.75rem] px-4 pb-8 pt-6",
        "glass-strong",
        className,
      )}
    >
      {/* Stage glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,230,207,0.22),transparent_70%)]" />
        <div className="absolute bottom-4 left-1/2 h-8 w-44 -translate-x-1/2 rounded-full bg-black/40 blur-md" />
      </div>

      {empty && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-sm text-[var(--color-text-muted)]"
        >
          انتخاب کن تا برگر زنده ساخته بشه
        </motion.p>
      )}

      <div className="relative z-10 flex w-full max-w-[220px] flex-col items-center gap-1">
        <AnimatePresence mode="popLayout">
          {hasBun && (
            <Layer key={`top-${state.bun}`} className="z-50 w-[92%]" delay={0.02}>
              <div
                className="h-10 w-full rounded-t-[999px] rounded-b-[18px] shadow-lg"
                style={{
                  background: `linear-gradient(180deg, ${bunTone[state.bun!] || "#E8B86D"} 0%, #c9924a 100%)`,
                  boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.15), 0 6px 14px rgba(0,0,0,0.25)",
                }}
              >
                {(state.bun === "bun-sesame" || state.bun === "bun-brioche") && (
                  <div className="flex justify-center gap-2 pt-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-[#f7e7c6]/90"
                        style={{ transform: `translateY(${(i % 2) * 2}px)` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Layer>
          )}

          {hasSauce && (
            <Layer key={`sauce-${state.sauce.join()}`} className="z-40 w-[84%]" delay={0.04}>
              <div className="relative h-3 w-full overflow-visible">
                <div
                  className="absolute inset-x-2 top-0 h-2 rounded-full opacity-90"
                  style={{
                    background:
                      "linear-gradient(90deg, #F7C5CC, #FFD3B6, #A8E6CF, #D4C1EC)",
                  }}
                />
                {[12, 28, 46, 62, 78].map((left, i) => (
                  <motion.span
                    key={left}
                    initial={{ height: 0 }}
                    animate={{ height: 10 + (i % 3) * 4 }}
                    className="absolute top-1 w-1.5 rounded-b-full bg-[#ffb4a8]/90"
                    style={{ left: `${left}%` }}
                  />
                ))}
              </div>
            </Layer>
          )}

          {hasToppings && (
            <Layer key={`tops-${state.toppings.join()}`} className="z-30 w-[88%]" delay={0.06}>
              <div className="space-y-1">
                {state.toppings.includes("top-lettuce") && (
                  <div className="h-3 w-full rounded-[40%] bg-gradient-to-r from-[#7dce82] via-[#a8e6cf] to-[#6bbf70] shadow-sm" />
                )}
                {state.toppings.includes("top-tomato") && (
                  <div className="mx-auto h-2.5 w-[92%] rounded-full bg-gradient-to-r from-[#e85d4c] to-[#ff8a7a]" />
                )}
                {state.toppings.includes("top-pickles") && (
                  <div className="mx-auto flex w-[80%] justify-between">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-2 w-5 rounded-full bg-[#c5d96a]" />
                    ))}
                  </div>
                )}
                {state.toppings.includes("top-jalapeno") && (
                  <div className="mx-auto flex w-[70%] justify-center gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className="h-2 w-3 rounded-full bg-[#3d8b3d]" />
                    ))}
                  </div>
                )}
                {state.toppings.includes("top-caramelized-onion") && (
                  <div className="mx-auto h-2 w-[85%] rounded-full bg-gradient-to-r from-[#c47a3a] to-[#e8b86d]" />
                )}
                {state.toppings.includes("top-mushroom") && (
                  <div className="mx-auto h-2.5 w-[75%] rounded-[50%] bg-[#c4b59a]" />
                )}
                {state.toppings.includes("top-bacon") && (
                  <div className="mx-auto h-2 w-[90%] rounded-sm bg-gradient-to-r from-[#a33b2b] via-[#f0c4a8] to-[#a33b2b]" />
                )}
                {state.toppings.includes("top-onion-ring") && (
                  <div className="mx-auto h-3 w-10 rounded-full border-2 border-[#e8b86d] bg-[#d4a017]/40" />
                )}
              </div>
            </Layer>
          )}

          {hasCheese && (
            <Layer key={`cheese-${state.cheese.join()}`} className="z-20 w-[90%]" delay={0.08}>
              <div className="relative">
                <div className="h-3 w-full rounded-md bg-gradient-to-b from-[#ffe08a] to-[#f0c14a] shadow-[0_4px_0_rgba(0,0,0,0.12)]" />
                <span className="absolute -bottom-2 left-2 h-4 w-3 rounded-b-full bg-[#f0c14a]" />
                <span className="absolute -bottom-3 right-4 h-5 w-3.5 rounded-b-full bg-[#ffd76a]" />
                {state.cheese.length > 1 && (
                  <div className="mt-1 h-2.5 w-full rounded-md bg-gradient-to-b from-[#f7e7c6] to-[#e8c878] opacity-90" />
                )}
              </div>
            </Layer>
          )}

          {hasPatty && (
            <Layer key={`patty-${state.patty}`} className="z-10 w-[94%]" delay={0.1}>
              <div
                className="h-5 w-full rounded-full"
                style={{
                  background: `linear-gradient(180deg, ${pattyTone[state.patty!] || "#6B3A2A"}, #3f2218)`,
                  boxShadow: "0 6px 10px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.12)",
                }}
              />
              {isDouble && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 h-5 w-full rounded-full"
                  style={{
                    background: "linear-gradient(180deg, #5A2E22, #3f2218)",
                    boxShadow: "0 6px 10px rgba(0,0,0,0.35)",
                  }}
                />
              )}
            </Layer>
          )}

          {hasBun && (
            <Layer key={`bottom-${state.bun}`} className="z-0 w-[92%]" delay={0.12}>
              <div
                className="h-7 w-full rounded-b-[999px] rounded-t-[16px]"
                style={{
                  background: `linear-gradient(180deg, ${bunTone[state.bun!] || "#E8B86D"}, #a87335)`,
                  boxShadow: "0 10px 18px rgba(0,0,0,0.35), inset 0 3px 0 rgba(255,255,255,0.15)",
                }}
              />
            </Layer>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
