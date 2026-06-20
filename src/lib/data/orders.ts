import "server-only";
import { prisma, hasDatabase } from "@/lib/db";
import { auth } from "@/auth";

export async function getMyOrders() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || !hasDatabase) return [];
  try {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } }, payment: true, shipment: true },
    });
  } catch {
    return [];
  }
}

export async function getOrder(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || !hasDatabase) return null;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        payment: true,
        shipment: true,
        address: true,
        cashbackEntries: true,
      },
    });
    if (!order || order.userId !== userId) return null;
    return order;
  } catch {
    return null;
  }
}
