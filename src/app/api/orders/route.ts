import { NextResponse } from "next/server";
import { getMyOrders } from "@/lib/data/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const orders = await getMyOrders();
  const view = orders.map((o) => ({
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    status: o.status,
    subtotalPaise: o.subtotalPaise,
    shippingPaise: o.shippingPaise,
    totalPaise: o.totalPaise,
    cashbackPaise: 0,
    items: o.items.map((i) => ({
      productId: i.productId,
      title: i.product.title,
      imageUrl: i.product.imageUrls[0] ?? "",
      qty: i.qty,
      unitPricePaise: i.unitPricePaise,
    })),
  }));
  return NextResponse.json({ orders: view });
}
