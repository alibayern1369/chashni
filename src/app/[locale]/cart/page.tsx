"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartContext } from "@/lib/providers/cart-provider";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { useMenuContext } from "@/lib/providers/data-provider";
import { formatPrice, calculateItemPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuantityControl } from "@/components/ui/quantity-control";
import { EmptyState } from "@/components/ui/empty-state";
import type { Locale } from "@/lib/types";
import {
  DEFAULT_TENANT_SLUG,
  pathForLocale,
  tenantSlugFromPathname,
} from "@/lib/routes";

export default function CartPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const slug = tenantSlugFromPathname(pathname) || DEFAULT_TENANT_SLUG;
  const { items, removeItem, updateQuantity, table, orderType, setOrderType, subtotal, discount, total, itemCount } =
    useCartContext();
  const { menuItems } = useMenuContext();

  const Arrow = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-[#faf5e4] mb-6">
          {isRtl ? "سبد خرید" : "Your Cart"}
          {itemCount > 0 && (
            <span className="text-sm font-normal text-[#888] mr-2">
              ({itemCount} {isRtl ? "آیتم" : "items"})
            </span>
          )}
        </h1>

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={28} />}
            title={isRtl ? "سبد خرید خالی است" : "Your cart is empty"}
            description={isRtl ? "چیزی به سبد اضافه کنید" : "Add items to get started"}
          />
        ) : (
          <div className="space-y-6">
            {/* Order type */}
            <div className="flex gap-2">
              <button
                onClick={() => setOrderType("dine-in")}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all border ${
                  orderType === "dine-in"
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    : "bg-[#141414] border-[#222] text-[#888]"
                }`}
              >
                {isRtl ? "🍽️ صرف در رستوران" : "🍽️ Dine In"}
              </button>
              <button
                onClick={() => setOrderType("takeaway")}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all border ${
                  orderType === "takeaway"
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    : "bg-[#141414] border-[#222] text-[#888]"
                }`}
              >
                {isRtl ? "📦 بیرون‌بر" : "📦 Takeaway"}
              </button>
            </div>

            {/* Table info */}
            {table && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-400 text-center font-semibold">
                {isRtl ? `میز ${table}` : `Table ${table}`}
              </div>
            )}

            {/* Items */}
            <div className="space-y-3">
              {items.map((cartItem, index) => {
                const isBurger = cartItem.menuItemId === "custom-burger";
                const menuItem = !isBurger
                  ? menuItems.find((m) => m.id === cartItem.menuItemId)
                  : null;
                if (!isBurger && !menuItem) return null;

                const name = isBurger
                  ? isRtl
                    ? cartItem.customBurger?.name || "برگر سفارشی نمکدان"
                    : cartItem.customBurger?.name || "Namakdan Custom Burger"
                  : isRtl
                    ? menuItem!.nameFa
                    : menuItem!.nameEn;
                const itemTotal = calculateItemPrice(cartItem, menuItems);

                return (
                  <motion.div
                    key={`${cartItem.menuItemId}-${index}`}
                    layout
                    className="flex gap-3 rounded-2xl bg-[#141414] border border-[#1e1e1e] p-3"
                  >
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1a1a1a]">
                      {isBurger ? (
                        <span className="text-3xl">🍔</span>
                      ) : (
                        <img
                          src={menuItem!.image}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-sm font-semibold text-[#faf5e4] truncate">{name}</h4>
                        {isBurger && (
                          <p className="text-[10px] text-amber-400">
                            {isRtl ? "برگر سفارشی" : "Custom Burger"}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <QuantityControl
                          value={cartItem.quantity}
                          onChange={(qty) => updateQuantity(index, qty)}
                          size="sm"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-amber-400 tabular-nums">
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

            {/* Summary */}
            <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 space-y-2">
              <div className="flex justify-between text-sm text-[#888]">
                <span>{isRtl ? "جمع" : "Subtotal"}</span>
                <span className="tabular-nums">{formatPrice(subtotal, locale)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>{isRtl ? "تخفیف" : "Discount"}</span>
                  <span className="tabular-nums">-{formatPrice(discount, locale)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[#faf5e4] pt-2 border-t border-[#1e1e1e]">
                <span>{isRtl ? "مجموع" : "Total"}</span>
                <span className="text-amber-400 tabular-nums">{formatPrice(total, locale)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => router.push(pathForLocale("/checkout", locale, slug))}
              icon={<Arrow size={16} />}
              iconPosition={isRtl ? "left" : "right"}
            >
              {isRtl ? "ثبت سفارش" : "Proceed to Checkout"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
