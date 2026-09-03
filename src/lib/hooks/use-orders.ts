"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  subscribeOrders,
  getOrdersSnapshot,
  initOrdersSnapshot,
  createOrder as createOrderFn,
  updateOrderStatus as updateStatusFn,
  clearAllOrders as clearAllOrdersFn,
} from "@/lib/store/order-store";
import type { Order, OrderStatus, CartItem } from "@/lib/types";

export function useOrders(): Order[] {
  useEffect(() => {
    initOrdersSnapshot();
  }, []);
  return useSyncExternalStore(subscribeOrders, getOrdersSnapshot, () => []);
}

export function useOrder(id: string | undefined): Order | undefined {
  const orders = useOrders();
  if (!id) return undefined;
  return orders.find((o) => o.id === id);
}

export function createOrder(params: {
  id: string;
  items: CartItem[];
  table?: string;
  orderType: "dine-in" | "takeaway";
  total: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}): Order {
  return createOrderFn(params);
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  return updateStatusFn(id, status);
}

export function clearAllOrders() {
  clearAllOrdersFn();
}
