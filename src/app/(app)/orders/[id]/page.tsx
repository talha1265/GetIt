"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, Loader2, Package, Truck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { useOrders, type OrderView } from "@/lib/store/orders";
import { formatPrice } from "@/lib/utils";

export default function OrderDetailPage() {
  const id = useParams().id as string;
  const callbackStatus = useSearchParams().get("status");
  const local = useOrders((s) => s.getOrder(id));
  const [remote, setRemote] = useState<OrderView | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (local) return;
    let active = true;
    fetch(`/api/orders/${id}`)
      .then((r) => (r.ok ? r.json() : { order: null }))
      .then((d) => {
        if (active) setRemote(d.order);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setFetched(true);
      });
    return () => {
      active = false;
    };
  }, [id, local]);

  const order = local ?? remote;
  const loading = !order && !fetched;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <Package className="h-9 w-9 text-muted" strokeWidth={1.5} />
        <p className="text-sm text-muted">We couldn&apos;t find this order.</p>
        <Link href="/orders" className="text-sm font-semibold text-accent">
          Back to orders
        </Link>
      </div>
    );
  }

  const paid =
    order.status === "PAID" || order.status === "CONFIRMED" || order.status === "DELIVERED";
  const failed = callbackStatus === "failed" || callbackStatus === "error";

  const banner = failed
    ? { icon: XCircle, color: "text-danger", title: "Payment not completed", sub: "No money was charged. You can try again." }
    : paid
      ? { icon: CheckCircle2, color: "text-cashback", title: "Order confirmed", sub: "Thanks! Your order is being prepared." }
      : { icon: Clock, color: "text-muted", title: "Awaiting payment", sub: "Complete payment to confirm your order." };
  const BannerIcon = banner.icon;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
        <BannerIcon className={`h-9 w-9 ${banner.color}`} />
        <div>
          <h1 className="text-base font-bold">{banner.title}</h1>
          <p className="text-xs text-muted">{banner.sub}</p>
        </div>
      </div>

      <section className="space-y-2 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold">Items</h2>
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <Media seed={item.productId} src={item.imageUrl} className="h-12 w-12 shrink-0" rounded="rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted">Qty {item.qty}</p>
            </div>
            <span className="text-sm font-semibold">
              {formatPrice(item.unitPricePaise * item.qty)}
            </span>
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
          <span>Total</span>
          <span>{formatPrice(order.totalPaise)}</span>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Payment</span>
          <Badge tone={paid ? "cashback" : "neutral"}>{paid ? "paid" : "pending"}</Badge>
        </div>
        {order.cashbackPaise > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Creator cashback</span>
            <span className="font-semibold text-cashback">{formatPrice(order.cashbackPaise)}</span>
          </div>
        )}
      </section>

      <section className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow-card)]">
        <Truck className="h-6 w-6 text-muted" strokeWidth={1.6} />
        <div className="flex-1">
          <p className="text-sm font-semibold">Delivery</p>
          <p className="text-xs text-muted">Will be scheduled via ShipRocket once confirmed.</p>
        </div>
      </section>

      {order.address && (
        <section className="rounded-2xl border border-border bg-surface p-3.5 text-sm shadow-[var(--shadow-card)]">
          <p className="font-semibold">{order.address.name}</p>
          <p className="text-muted">
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city},{" "}
            {order.address.state} {order.address.pincode}
          </p>
          <p className="text-muted">{order.address.phone}</p>
        </section>
      )}

      <Link href="/orders">
        <Button variant="outline" size="lg" fullWidth>
          All orders
        </Button>
      </Link>
    </div>
  );
}
