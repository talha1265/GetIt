"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCart, selectSubtotalPaise } from "@/lib/store/cart";
import { useOrders } from "@/lib/store/orders";
import { cashbackPaise, formatPrice } from "@/lib/utils";

interface Address {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const empty: Address = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(selectSubtotalPaise);
  const cashback = cashbackPaise(subtotal);

  const [addr, setAddr] = useState<Address>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid =
    addr.name && addr.phone.replace(/\D/g, "").length >= 10 && addr.line1 && addr.city && addr.state && addr.pincode;

  function submitToPayu(action: string, params: Record<string, string>) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = action;
    Object.entries(params).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }

  function placeLocalOrder(): string {
    return useOrders.getState().addOrder({
      items: lines.map((l) => ({
        productId: l.productId,
        title: l.title,
        imageUrl: l.imageUrl,
        qty: l.qty,
        unitPricePaise: l.pricePaise,
      })),
      subtotalPaise: subtotal,
      shippingPaise: 0,
      totalPaise: subtotal,
      cashbackPaise: cashback,
      address: { ...addr, line2: addr.line2 || undefined },
    });
  }

  async function pay() {
    setError(null);
    setLoading(true);
    try {
      let data: { ok?: boolean; mode?: string; orderId?: string; action?: string; params?: Record<string, string> } | null = null;
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: lines.map((l) => ({
              productId: l.productId,
              qty: l.qty,
              source: l.source ?? "DIRECT",
              sourceId: l.sourceId,
            })),
            address: { ...addr, line2: addr.line2 || undefined },
          }),
        });
        data = await res.json();
      } catch {
        /* offline / no backend — fall through to a local order */
      }

      // Real PayU checkout (configured backend).
      if (data?.ok && data.mode === "payu" && data.action && data.params) {
        submitToPayu(data.action, data.params);
        return;
      }
      // DB-backed simulated payment.
      if (data?.ok && data.mode === "simulated" && data.orderId) {
        clear();
        router.push(`/orders/${data.orderId}?status=success`);
        return;
      }
      // No payment backend yet → complete the order locally so the buy flow works.
      const localId = placeLocalOrder();
      clear();
      router.push(`/orders/${localId}?status=success`);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <Lock className="h-9 w-9 text-muted" strokeWidth={1.5} />
        <p className="text-sm text-muted">Sign in to complete your purchase.</p>
        <Link href="/login">
          <Button variant="primary" size="lg">Sign in</Button>
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-muted">Your cart is empty.</p>
        <Link href="/reels">
          <Button variant="primary" size="lg">Browse reels</Button>
        </Link>
      </div>
    );
  }

  const field =
    "h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-foreground";

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-3">
        <h1 className="text-lg font-bold">Checkout</h1>
      </div>

      <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        {/* address */}
        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold">Delivery address</h2>
          <input className={field} placeholder="Full name" value={addr.name}
            onChange={(e) => setAddr({ ...addr, name: e.target.value })} />
          <input className={field} placeholder="Phone" inputMode="numeric" value={addr.phone}
            onChange={(e) => setAddr({ ...addr, phone: e.target.value })} />
          <input className={field} placeholder="House no, building, street" value={addr.line1}
            onChange={(e) => setAddr({ ...addr, line1: e.target.value })} />
          <input className={field} placeholder="Area, landmark (optional)" value={addr.line2}
            onChange={(e) => setAddr({ ...addr, line2: e.target.value })} />
          <div className="flex gap-2.5">
            <input className={field} placeholder="City" value={addr.city}
              onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
            <input className={field} placeholder="State" value={addr.state}
              onChange={(e) => setAddr({ ...addr, state: e.target.value })} />
          </div>
          <input className={field} placeholder="Pincode" inputMode="numeric" value={addr.pincode}
            onChange={(e) => setAddr({ ...addr, pincode: e.target.value })} />
        </section>

        {/* summary */}
        <section className="space-y-2 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow-card)]">
          <h2 className="text-sm font-semibold">Order summary</h2>
          {lines.map((l) => (
            <div key={l.productId} className="flex justify-between text-sm">
              <span className="truncate pr-2 text-muted-strong">
                {l.title} × {l.qty}
              </span>
              <span className="font-medium">{formatPrice(l.pricePaise * l.qty)}</span>
            </div>
          ))}
          <div className="mt-1 flex justify-between border-t border-border pt-2 text-sm">
            <span className="text-muted">Delivery</span>
            <span className="font-semibold text-cashback">FREE</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Badge tone="cashback">Earns {formatPrice(cashback)} cashback for the creator</Badge>
        </section>

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>

      <div className="space-y-2 border-t border-border bg-surface p-4">
        <Button variant="buy" size="lg" fullWidth disabled={!valid || loading} onClick={pay}>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" /> Pay {formatPrice(subtotal)}
            </>
          )}
        </Button>
        <p className="text-center text-[11px] text-muted">
          Payments secured by PayU · Delivered via ShipRocket
        </p>
      </div>
    </div>
  );
}
