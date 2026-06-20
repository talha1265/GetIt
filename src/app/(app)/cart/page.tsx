"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCart, selectSubtotalPaise } from "@/lib/store/cart";
import { cashbackPaise, formatPrice } from "@/lib/utils";

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart(selectSubtotalPaise);
  const cashback = cashbackPaise(subtotal);

  if (lines.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted">
          <ShoppingBag className="h-9 w-9 text-muted" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-lg font-bold">Your cart is empty</h2>
          <p className="mt-1 text-sm text-muted">
            Shop straight from reels and posts you love.
          </p>
        </div>
        <Link href="/reels">
          <Button variant="primary" size="lg">
            Browse reels
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold">Cart</h1>
        <span className="text-sm text-muted">{lines.length} items</span>
      </div>

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4">
        {lines.map((line) => (
          <div
            key={line.productId}
            className="flex gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-card)]"
          >
            <Media
              seed={line.productId}
              label={line.title}
              className="h-20 w-20 shrink-0"
              rounded="rounded-[0.75rem]"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="line-clamp-2 text-sm font-medium">{line.title}</p>
              <p className="text-xs text-muted">by {line.sellerName}</p>
              <p className="mt-1 text-sm font-bold">{formatPrice(line.pricePaise)}</p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center gap-3 rounded-full border border-border px-1">
                  <button
                    aria-label="Decrease"
                    onClick={() => setQty(line.productId, line.qty - 1)}
                    className="flex h-7 w-7 items-center justify-center text-muted-strong"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-4 text-center text-sm font-semibold">
                    {line.qty}
                  </span>
                  <button
                    aria-label="Increase"
                    onClick={() => setQty(line.productId, line.qty + 1)}
                    className="flex h-7 w-7 items-center justify-center text-muted-strong"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  aria-label="Remove"
                  onClick={() => removeItem(line.productId)}
                  className="text-muted hover:text-danger"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* summary */}
      <div className="space-y-3 border-t border-border bg-surface p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Delivery</span>
          <span className="font-semibold text-cashback">FREE</span>
        </div>
        <div className="flex items-center justify-between">
          <Badge tone="cashback">You&apos;ll earn {formatPrice(cashback)} cashback</Badge>
        </div>
        <Link href="/checkout">
          <Button variant="buy" size="lg" fullWidth>
            Checkout · {formatPrice(subtotal)}
          </Button>
        </Link>
        <p className="text-center text-[11px] text-muted">
          Secured by PayU · Delivered via ShipRocket
        </p>
      </div>
    </div>
  );
}
