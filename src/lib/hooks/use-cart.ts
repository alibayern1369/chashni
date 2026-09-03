"use client";

import { useCartContext } from "@/lib/providers/cart-provider";

export function useCart() {
  return useCartContext();
}
