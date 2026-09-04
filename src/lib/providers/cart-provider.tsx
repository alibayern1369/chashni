"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import type { CartItem, CartState, OrderType } from "@/lib/types";
import { useMenuContext } from "@/lib/providers/data-provider";
import { calculateCartTotal } from "@/lib/utils";

const STORAGE_KEY = "chashni-cart";

function getStoredCart(): CartState {
  if (typeof window === "undefined") return { items: [], orderType: "dine-in" };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartState) : { items: [], orderType: "dine-in" };
  } catch {
    return { items: [], orderType: "dine-in" };
  }
}

interface CartContextValue {
  items: CartItem[];
  table?: string;
  orderType: OrderType;
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  setTable: (table: string | undefined) => void;
  setOrderType: (type: OrderType) => void;
  setDiscount?: (discount: number) => void;
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
  const { menuItems } = useMenuContext();
  const [state, setState] = useState<CartState>(() => getStoredCart());
  const [extraDiscount, setExtraDiscount] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

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
    setState({ items: [], orderType: "dine-in" });
    setExtraDiscount(0);
  }, []);

  const setTable = useCallback((table: string | undefined) => {
    setState((prev) => ({ ...prev, table }));
  }, []);

  const setOrderType = useCallback((orderType: OrderType) => {
    setState((prev) => ({ ...prev, orderType }));
  }, []);

  const setDiscount = useCallback((discount: number) => {
    setExtraDiscount(Math.max(0, discount));
  }, []);

  const itemCount = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items],
  );
  const totals = useMemo(
    () => calculateCartTotal(state.items, menuItems),
    [state.items, menuItems],
  );
  const discount = Math.max(totals.discount, extraDiscount);
  const total = Math.max(0, totals.subtotal - discount);

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
        setDiscount,
        itemCount,
        subtotal: totals.subtotal,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
