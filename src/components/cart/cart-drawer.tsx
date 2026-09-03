"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Trash2, ShoppingBag, Plus } from "lucide-react";
import { useCartContext } from "@/lib/providers/cart-provider";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { menuItems } from "@/lib/data";
import { cn, formatPrice, calculateItemPrice, calculateCartTotal } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { QuantityControl } from "@/components/ui/quantity-control";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
  className?: string;
}

export function CartDrawer({ isOpen, onClose, onCheckout, className }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, table, total, subtotal, discount, itemCount } =
    useCartContext();
  const { locale } = useLocaleContext();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: locale === "fa" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: locale === "fa" ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed top-0 bottom-0 z-[70] w-full max-w-md",
              "bg-[#0a0a0a] border-l border-r border-[#222]",
              locale === "fa" ? "left-0" : "right-0",
              className
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[#1e1e1e] px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-[#faf5e4]">
                    {locale === "fa" ? "سبد خرید" : "Cart"}
                  </h2>
                  {table && (
                    <span className="text-xs text-amber-400">
                      {locale === "fa" ? `میز ${table}` : `Table ${table}`}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e1e1e] border border-[#333] text-[#888] hover:text-[#ccc]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {items.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBag size={28} />}
                    title={locale === "fa" ? "سبد خرید خالی است" : "Your cart is empty"}
                    description={
                      locale === "fa"
                        ? "چیزی به سبد اضافه کنید"
                        : "Add items to get started"
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {items.map((cartItem, index) => {
                      const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);
                      if (!menuItem) return null;
                      const name = locale === "fa" ? menuItem.nameFa : menuItem.nameEn;
                      const itemTotal = calculateItemPrice(cartItem, menuItems);

                      return (
                        <motion.div
                          key={`${cartItem.menuItemId}-${index}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className="flex gap-3 rounded-2xl bg-[#141414] border border-[#1e1e1e] p-3"
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#1a1a1a]">
                            <img
                              src={menuItem.image}
                              alt={name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="flex flex-1 flex-col justify-between min-w-0">
                            <div>
                              <h4 className="text-sm font-semibold text-[#faf5e4] truncate">{name}</h4>
                              {Object.entries(cartItem.selectedOptions).map(([groupId, optIds]) => {
                                const group = menuItem.options.find((g) => g.id === groupId);
                                if (!group) return null;
                                const names = optIds.map((id) => {
                                  const opt = group.options.find((o) => o.id === id);
                                  return opt ? (locale === "fa" ? opt.nameFa : opt.nameEn) : "";
                                }).filter(Boolean);
                                if (names.length === 0) return null;
                                return (
                                  <p key={groupId} className="text-[10px] text-[#666] truncate">
                                    {locale === "fa" ? group.nameFa : group.nameEn}: {names.join(", ")}
                                  </p>
                                );
                              })}
                            </div>

                            <div className="flex items-center justify-between">
                              <QuantityControl
                                value={cartItem.quantity}
                                onChange={(qty) => updateQuantity(index, qty)}
                                size="sm"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-amber-400 tabular-nums">
                                  {formatPrice(itemTotal, locale)}
                                </span>
                                <button
                                  onClick={() => removeItem(index)}
                                  className="text-[#555] hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-[#1e1e1e] px-5 py-4 space-y-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-[#888]">
                      <span>{locale === "fa" ? "جمع" : "Subtotal"}</span>
                      <span className="tabular-nums">{formatPrice(subtotal, locale)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>{locale === "fa" ? "تخفیف" : "Discount"}</span>
                        <span className="tabular-nums">-{formatPrice(discount, locale)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-[#faf5e4] pt-1 border-t border-[#1e1e1e]">
                      <span>{locale === "fa" ? "مجموع" : "Total"}</span>
                      <span className="text-amber-400 tabular-nums">{formatPrice(total, locale)}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={onCheckout}
                    icon={<Plus size={16} />}
                  >
                    {locale === "fa" ? "ثبت سفارش" : "Checkout"}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
