"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** One graphical layer per builder stage (not per ingredient). */
export interface BurgerVisualState {
  hasBun: boolean;
  hasPatty: boolean;
  hasCheese: boolean;
  hasToppings: boolean;
  hasSauce: boolean;
}

interface BurgerVisualProps {
  state: BurgerVisualState;
  className?: string;
}

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
      initial={{ opacity: 0, y: -24, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 300, damping: 22, delay }}
      className={cn("relative mx-auto", className)}
    >
      {children}
    </motion.div>
  );
}

export function BurgerVisual({ state, className }: BurgerVisualProps) {
  const empty =
    !state.hasBun &&
    !state.hasPatty &&
    !state.hasCheese &&
    !state.hasToppings &&
    !state.hasSauce;

  return (
    <div
      className={cn(
        "relative flex min-h-[260px] items-end justify-center overflow-hidden rounded-[1.75rem] px-4 pb-8 pt-6",
        "glass-strong",
        className,
      )}
    >
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
          هر مرحله رو که انتخاب کنی، یه لایه به برگر اضافه میشه
        </motion.p>
      )}

      <div className="relative z-10 flex w-full max-w-[220px] flex-col items-center gap-1.5">
        <AnimatePresence mode="popLayout">
          {state.hasBun && (
            <Layer key="stage-bun-top" className="z-50 w-[92%]">
              <div
                className="h-11 w-full rounded-t-[999px] rounded-b-[18px]"
                style={{
                  background: "linear-gradient(180deg, #f0c27a 0%, #c9924a 100%)",
                  boxShadow:
                    "inset 0 -6px 12px rgba(0,0,0,0.15), 0 6px 14px rgba(0,0,0,0.25)",
                }}
              >
                <div className="flex justify-center gap-2.5 pt-3.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[#fff1d0]/95"
                      style={{ transform: `translateY(${(i % 2) * 2}px)` }}
                    />
                  ))}
                </div>
              </div>
            </Layer>
          )}

          {state.hasSauce && (
            <Layer key="stage-sauce" className="z-40 w-[84%]" delay={0.03}>
              <div className="relative h-4 w-full">
                <div className="absolute inset-x-1 top-0 h-2.5 rounded-full bg-gradient-to-r from-[#f7c5cc] via-[#ffd3b6] to-[#a8e6cf]" />
                {[18, 38, 58, 78].map((left, i) => (
                  <motion.span
                    key={left}
                    initial={{ height: 0 }}
                    animate={{ height: 8 + (i % 3) * 3 }}
                    className="absolute top-1.5 w-1.5 rounded-b-full bg-[#ffb4a8]/95"
                    style={{ left: `${left}%` }}
                  />
                ))}
              </div>
            </Layer>
          )}

          {state.hasToppings && (
            <Layer key="stage-toppings" className="z-30 w-[88%]" delay={0.05}>
              <div className="relative h-5 w-full overflow-hidden rounded-[40%]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#6bbf70] via-[#a8e6cf] to-[#e85d4c]" />
                <div className="absolute inset-x-[12%] top-1 h-2 rounded-full bg-[#ff8a7a]/90" />
                <div className="absolute inset-x-[20%] bottom-1 h-1.5 rounded-full bg-[#c5d96a]/90" />
              </div>
            </Layer>
          )}

          {state.hasCheese && (
            <Layer key="stage-cheese" className="z-20 w-[90%]" delay={0.07}>
              <div className="relative">
                <div className="h-3.5 w-full rounded-md bg-gradient-to-b from-[#ffe08a] to-[#f0c14a] shadow-[0_4px_0_rgba(0,0,0,0.12)]" />
                <span className="absolute -bottom-2 left-3 h-4 w-3 rounded-b-full bg-[#f0c14a]" />
                <span className="absolute -bottom-3 right-5 h-5 w-3.5 rounded-b-full bg-[#ffd76a]" />
              </div>
            </Layer>
          )}

          {state.hasPatty && (
            <Layer key="stage-patty" className="z-10 w-[94%]" delay={0.09}>
              <div
                className="h-6 w-full rounded-full"
                style={{
                  background: "linear-gradient(180deg, #7a4432, #3f2218)",
                  boxShadow:
                    "0 6px 10px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.12)",
                }}
              />
            </Layer>
          )}

          {state.hasBun && (
            <Layer key="stage-bun-bottom" className="z-0 w-[92%]" delay={0.11}>
              <div
                className="h-8 w-full rounded-b-[999px] rounded-t-[16px]"
                style={{
                  background: "linear-gradient(180deg, #e0a85c, #a87335)",
                  boxShadow:
                    "0 10px 18px rgba(0,0,0,0.35), inset 0 3px 0 rgba(255,255,255,0.15)",
                }}
              />
            </Layer>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
