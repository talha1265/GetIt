import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Media } from "@/components/ui/Media";
import { getMyOrders } from "@/lib/data/orders";
import { formatPrice, relativeTime } from "@/lib/utils";

const STATUS_TONE: Record<string, "neutral" | "cashback" | "accent" | "danger"> = {
  CREATED: "neutral",
  PAYMENT_PENDING: "neutral",
  PAID: "cashback",
  CONFIRMED: "cashback",
  SHIPPED: "accent",
  DELIVERED: "cashback",
  CANCELLED: "danger",
  REFUNDED: "danger",
};

export default async function OrdersPage() {
  const orders = await getMyOrders();

  if (orders.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted">
          <Package className="h-9 w-9 text-muted" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-lg font-bold">No orders yet</h2>
          <p className="mt-1 text-sm text-muted">
            Your purchases will show up here once you check out.
          </p>
        </div>
        <Link href="/" className="text-sm font-semibold text-accent">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <h1 className="px-1 text-lg font-bold">Your orders</h1>
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}`}
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-card)]"
        >
          <Media
            seed={order.items[0]?.productId ?? order.id}
            className="h-14 w-14 shrink-0"
            rounded="rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge tone={STATUS_TONE[order.status] ?? "neutral"}>
                {order.status.replace("_", " ").toLowerCase()}
              </Badge>
              <span className="text-[11px] text-muted">{relativeTime(order.createdAt)} ago</span>
            </div>
            <p className="mt-1 line-clamp-1 text-sm font-medium">
              {order.items.map((i) => i.product.title).join(", ")}
            </p>
            <p className="text-sm font-bold">{formatPrice(order.totalPaise)}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted" />
        </Link>
      ))}
    </div>
  );
}
