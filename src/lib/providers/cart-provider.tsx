"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { CartItem, CartState } from "@/lib/types";
import { menuItems } from "@/lib/data";
import { calculateCartTotal, calculateItemPrice } from "@/lib/utils";

interface CartContextValue {
  items: CartItem[];
  table?: string;
  orderType: "dine-in" | "takeaway";
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  setTable: (table: string | undefined) => void;
  setOrderType: (type: "dine-in" | "takeaway") => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  orderType: "dine-in",
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  setTable: () => {},
  setOrderType: () => {},
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  total: 0,
});

export function useCartContext() {
  return useContext(CartContext);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({
    items: [],
    orderType: "dine-in",
  });

  const addItem = useCallback((item: CartItem) => {
    setState((prev) => ({ ...prev, items: [...prev.items, item] }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    if (quantity <= 0) {
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
      return;
    }
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, quantity } : item)),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState((prev) => ({ ...prev, items: [] }));
  }, []);

  const setTable = useCallback((table: string | undefined) => {
    setState((prev) => ({ ...prev, table }));
  }, []);

  const setOrderType = useCallback((orderType: "dine-in" | "takeaway") => {
    setState((prev) => ({ ...prev, orderType }));
  }, []);

  const itemCount = useMemo(() => state.items.reduce((sum, item) => sum + item.quantity, 0), [state.items]);
  const { subtotal, discount, total } = useMemo(
    () => calculateCartTotal(state.items, menuItems),
    [state.items]
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        table: state.table,
        orderType: state.orderType,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setTable,
        setOrderType,
        itemCount,
        subtotal,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
