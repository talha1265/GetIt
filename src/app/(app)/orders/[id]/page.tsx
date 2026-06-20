import Link from "next/link";
import { CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { getOrder } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status: callbackStatus } = await searchParams;
  const order = await getOrder(id);

  if (!order) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <Package className="h-9 w-9 text-muted" strokeWidth={1.5} />
        <p className="text-sm text-muted">
          We couldn&apos;t find this order. It may need a database connection, or
          you may need to sign in.
        </p>
        <Link href="/orders" className="text-sm font-semibold text-accent">
          Back to orders
        </Link>
      </div>
    );
  }

  const paid = order.status === "PAID" || order.status === "CONFIRMED" || order.status === "DELIVERED";
  const failed = callbackStatus === "failed" || callbackStatus === "error";

  const banner = failed
    ? { icon: XCircle, tone: "danger" as const, title: "Payment not completed", sub: "No money was charged. You can try again." }
    : paid
      ? { icon: CheckCircle2, tone: "cashback" as const, title: "Payment successful", sub: "Your order is confirmed and being prepared." }
      : { icon: Clock, tone: "neutral" as const, title: "Awaiting payment", sub: "Complete payment to confirm your order." };

  const BannerIcon = banner.icon;

  return (
    <div className="space-y-4 p-4">
      {/* status banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
        <BannerIcon
          className={
            banner.tone === "cashback"
              ? "h-9 w-9 text-cashback"
              : banner.tone === "danger"
                ? "h-9 w-9 text-danger"
                : "h-9 w-9 text-muted"
          }
        />
        <div>
          <h1 className="text-base font-bold">{banner.title}</h1>
          <p className="text-xs text-muted">{banner.sub}</p>
        </div>
      </div>

      {/* items */}
      <section className="space-y-2 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold">Items</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <Media seed={item.productId} className="h-12 w-12 shrink-0" rounded="rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.product.title}</p>
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

      {/* payment + cashback */}
      <section className="space-y-2 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Payment</span>
          <Badge tone={order.payment?.status === "SUCCESS" ? "cashback" : "neutral"}>
            {order.payment?.status?.toLowerCase() ?? "pending"}
          </Badge>
        </div>
        {order.cashbackEntries.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Creator cashback</span>
            <span className="font-semibold text-cashback">
              {formatPrice(order.cashbackEntries.reduce((s, c) => s + c.amountPaise, 0))}
            </span>
          </div>
        )}
      </section>

      {/* shipment */}
      <section className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow-card)]">
        <Truck className="h-6 w-6 text-muted" strokeWidth={1.6} />
        <div className="flex-1">
          <p className="text-sm font-semibold">Delivery</p>
          <p className="text-xs text-muted">
            {order.shipment?.status
              ? order.shipment.status.replace(/_/g, " ").toLowerCase()
              : "Will be scheduled via ShipRocket once confirmed."}
          </p>
        </div>
      </section>

      {/* address */}
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
