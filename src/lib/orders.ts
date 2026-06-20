import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { ItemSource } from "@/lib/types";

export interface OrderItemInput {
  productId: string;
  qty: number;
  source: ItemSource;
  sourcePostId?: string;
  sourceReelId?: string;
}

export interface AddressInput {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

const CASHBACK_RATE = 0.05;

/**
 * Create an order from the buyer's cart. Prices are re-read from the DB —
 * client-supplied amounts are never trusted. Creates the Order, OrderItems and
 * an INITIATED Payment in a single transaction.
 */
export async function createOrder(params: {
  userId: string;
  items: OrderItemInput[];
  address: AddressInput;
}) {
  const { userId, items, address } = params;
  if (items.length === 0) throw new Error("Cart is empty.");

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const orderItems = items.map((i) => {
    const p = byId.get(i.productId);
    if (!p) throw new Error("A product in your cart is no longer available.");
    const qty = Math.max(1, Math.floor(i.qty));
    subtotal += p.pricePaise * qty;
    return {
      productId: p.id,
      sellerId: p.sellerId,
      qty,
      unitPricePaise: p.pricePaise,
      source: i.source,
      sourcePostId: i.source === "POST" ? (i.sourcePostId ?? null) : null,
      sourceReelId: i.source === "REEL" ? (i.sourceReelId ?? null) : null,
    };
  });

  const shippingPaise = 0; // free delivery for now
  const totalPaise = subtotal + shippingPaise;

  const addr = await prisma.address.create({
    data: {
      userId,
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? null,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    },
  });

  return prisma.order.create({
    data: {
      userId,
      status: "PAYMENT_PENDING",
      subtotalPaise: subtotal,
      shippingPaise,
      totalPaise,
      addressId: addr.id,
      items: { create: orderItems },
      payment: { create: { amountPaise: totalPaise, status: "INITIATED" } },
    },
    include: { items: true },
  });
}

/** Idempotently credit 5% creator cashback for a paid order. */
export async function creditCashbackForOrder(orderId: string): Promise<void> {
  const already = await prisma.cashbackEntry.count({ where: { orderId } });
  if (already > 0) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  for (const item of order.items) {
    let beneficiaryId: string | null = null;
    if (item.sourcePostId) {
      const post = await prisma.post.findUnique({
        where: { id: item.sourcePostId },
        select: { authorId: true },
      });
      beneficiaryId = post?.authorId ?? null;
    } else if (item.sourceReelId) {
      const reel = await prisma.reel.findUnique({
        where: { id: item.sourceReelId },
        select: { authorId: true },
      });
      beneficiaryId = reel?.authorId ?? null;
    }
    // No attribution, or buyer is the creator → no cashback.
    if (!beneficiaryId || beneficiaryId === order.userId) continue;

    const amount = Math.round(item.unitPricePaise * item.qty * CASHBACK_RATE);
    if (amount <= 0) continue;

    await prisma.$transaction([
      prisma.cashbackEntry.create({
        data: {
          userId: beneficiaryId,
          orderId,
          orderItemId: item.id,
          amountPaise: amount,
          rate: CASHBACK_RATE,
          status: "CREDITED",
          reason: item.sourcePostId ? "Post purchase" : "Reel purchase",
        },
      }),
      prisma.user.update({
        where: { id: beneficiaryId },
        data: { cashbackPaise: { increment: amount } },
      }),
    ]);
  }
}

/** Mark an order paid (idempotent) and credit cashback. */
export async function markOrderPaid(
  orderId: string,
  providerPaymentId: string | null,
  raw?: unknown,
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found.");
  if (order.status === "PAID" || order.status === "CONFIRMED") return order;

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: {
        status: "SUCCESS",
        providerPaymentId,
        raw: (raw ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    }),
    prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } }),
  ]);

  await creditCashbackForOrder(orderId);
  return order;
}

/** Mark an order's payment failed (kept pending so it can be retried). */
export async function markOrderFailed(orderId: string, raw?: unknown) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status === "PAID") return;
  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: {
        status: "FAILED",
        raw: (raw ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    }),
    prisma.order.update({ where: { id: orderId }, data: { status: "PAYMENT_PENDING" } }),
  ]);
}
