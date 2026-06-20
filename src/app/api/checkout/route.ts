import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { hasDatabase } from "@/lib/db";
import { createOrder, markOrderPaid, type OrderItemInput } from "@/lib/orders";
import { buildPayuRequest, hasPayU } from "@/lib/payments/payu";

export const runtime = "nodejs";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().positive(),
        source: z.enum(["DIRECT", "POST", "REEL"]),
        sourceId: z.string().optional(),
      }),
    )
    .min(1),
  address: z.object({
    name: z.string().min(1),
    phone: z.string().min(8).max(15),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(4).max(10),
  }),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Sign in to check out." }, { status: 401 });
  }
  if (!hasDatabase) {
    return NextResponse.json(
      { ok: false, error: "Checkout needs a database connection." },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid checkout data." }, { status: 400 });
  }

  const items: OrderItemInput[] = parsed.data.items.map((i) => ({
    productId: i.productId,
    qty: i.qty,
    source: i.source,
    sourcePostId: i.source === "POST" ? i.sourceId : undefined,
    sourceReelId: i.source === "REEL" ? i.sourceId : undefined,
  }));

  let order;
  try {
    order = await createOrder({ userId, items, address: parsed.data.address });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? "Could not create order." },
      { status: 400 },
    );
  }

  const origin = new URL(req.url).origin;

  if (hasPayU) {
    const phoneDigits = (session.user?.phone ?? "").replace(/\D/g, "") || "0000000000";
    const callback = `${origin}/api/payments/payu/callback`;
    const payu = buildPayuRequest({
      txnid: order.id,
      amountPaise: order.totalPaise,
      productinfo: `getIt order ${order.id}`,
      firstname: session.user?.name || session.user?.username || "Customer",
      email: `${phoneDigits}@getit.app`,
      phone: phoneDigits,
      surl: callback,
      furl: callback,
      udf1: userId,
    });
    return NextResponse.json({ ok: true, mode: "payu", ...payu });
  }

  // No gateway configured: simulate a successful payment in non-production so
  // the full order + cashback flow stays demoable against a real database.
  if (process.env.NODE_ENV !== "production") {
    await markOrderPaid(order.id, "SIMULATED", { simulated: true });
    return NextResponse.json({ ok: true, mode: "simulated", orderId: order.id });
  }

  return NextResponse.json(
    { ok: false, error: "Payments are not configured.", orderId: order.id },
    { status: 503 },
  );
}
