"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderItemView {
  productId: string;
  title: string;
  imageUrl: string;
  qty: number;
  unitPricePaise: number;
}

export interface OrderAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderView {
  id: string;
  createdAt: string;
  status: string;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  cashbackPaise: number;
  items: OrderItemView[];
  address?: OrderAddress;
}

type NewOrder = Omit<OrderView, "id" | "createdAt" | "status">;

interface OrdersState {
  orders: OrderView[];
  addOrder: (order: NewOrder) => string;
  getOrder: (id: string) => OrderView | undefined;
}

/**
 * Client-side order history. Used so the buy → confirmation → history flow
 * works with no backend. When a real database is connected, server orders are
 * fetched from /api/orders and merged with these for display.
 */
export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => {
        const id = `local_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        const full: OrderView = {
          ...order,
          id,
          createdAt: new Date().toISOString(),
          status: "PAID",
        };
        set((s) => ({ orders: [full, ...s.orders] }));
        return id;
      },
      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: "getit-orders" },
  ),
);
