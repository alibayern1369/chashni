import type { Order, OrderStatus, CartItem } from "@/lib/types";

const STORAGE_KEY = "chashni-orders";
const listeners: Set<() => void> = new Set();
let cachedSnapshot: Order[] = [];

function emitChange() {
  cachedSnapshot = getStoredOrders();
  for (const listener of listeners) listener();
}

function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map((o) => ({
      ...o,
      createdAt: new Date(o.createdAt as string),
    })) as Order[];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  emitChange();
}

export function subscribeOrders(callback: () => void): () => void {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}

export function getOrdersSnapshot(): Order[] {
  return cachedSnapshot;
}

export function initOrdersSnapshot() {
  cachedSnapshot = getStoredOrders();
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
  const order: Order = {
    id: params.id,
    items: params.items,
    table: params.table,
    orderType: params.orderType,
    status: "received",
    total: params.total,
    createdAt: new Date(),
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    notes: params.notes,
  };
  const orders = getStoredOrders();
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const orders = getStoredOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], status };
  saveOrders(orders);
  return orders[idx];
}

export function getOrder(id: string): Order | undefined {
  return getStoredOrders().find((o) => o.id === id);
}

export function clearAllOrders() {
  saveOrders([]);
}
