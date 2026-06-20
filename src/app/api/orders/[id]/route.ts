import { NextResponse } from "next/server";
import { getOrder } from "@/lib/data/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const o = await getOrder(id);
  if (!o) return NextResponse.json({ order: null }, { status: 404 });

  const view = {
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    status: o.status,
    subtotalPaise: o.subtotalPaise,
    shippingPaise: o.shippingPaise,
    totalPaise: o.totalPaise,
    cashbackPaise: o.cashbackEntries.reduce((s, c) => s + c.amountPaise, 0),
    items: o.items.map((i) => ({
      productId: i.productId,
      title: i.product.title,
      imageUrl: i.product.imageUrls[0] ?? "",
      qty: i.qty,
      unitPricePaise: i.unitPricePaise,
    })),
    address: o.address
      ? {
          name: o.address.name,
          phone: o.address.phone,
          line1: o.address.line1,
          line2: o.address.line2 ?? undefined,
          city: o.address.city,
          state: o.address.state,
          pincode: o.address.pincode,
        }
      : undefined,
  };
  return NextResponse.json({ order: view });
}
