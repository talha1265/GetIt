"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, ItemSource, Product } from "@/lib/types";

interface AddOptions {
  qty?: number;
  source?: ItemSource;
  sourceId?: string;
}

interface CartState {
  lines: CartLine[];
  addItem: (product: Product, opts?: AddOptions) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addItem: (product, opts = {}) =>
        set((state) => {
          const { qty = 1, source, sourceId } = opts;
          const existing = state.lines.find((l) => l.productId === product.id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === product.id
                  ? {
                      ...l,
                      qty: l.qty + qty,
                      // Keep the first creator attribution unless it was a direct add.
                      source: l.source && l.source !== "DIRECT" ? l.source : source,
                      sourceId: l.source && l.source !== "DIRECT" ? l.sourceId : sourceId,
                    }
                  : l,
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
            source: source ?? "DIRECT",
            sourceId,
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
