"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Product } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addItem: (product, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === product.id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === product.id ? { ...l, qty: l.qty + qty } : l,
              ),
            };
          }
          const line: CartLine = {
            productId: product.id,
            title: product.title,
            pricePaise: product.pricePaise,
            imageUrl: product.imageUrl,
            sellerName: product.seller.displayName,
            qty,
          };
          return { lines: [...state.lines, line] };
        }),
      removeItem: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),
      setQty: (productId, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => l.productId !== productId)
              : state.lines.map((l) => (l.productId === productId ? { ...l, qty } : l)),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "getit-cart" },
  ),
);

/** Derived selectors (call with the hook to stay reactive). */
export const selectCount = (s: CartState) =>
  s.lines.reduce((n, l) => n + l.qty, 0);
export const selectSubtotalPaise = (s: CartState) =>
  s.lines.reduce((sum, l) => sum + l.pricePaise * l.qty, 0);
