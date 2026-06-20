import "server-only";
import { prisma, hasDatabase } from "@/lib/db";
import { mapProduct } from "@/lib/data/feed";
import { productById } from "@/lib/mock/data";
import type { Product } from "@/lib/types";

export async function getProduct(id: string): Promise<Product | null> {
  if (hasDatabase) {
    try {
      const p = await prisma.product.findUnique({
        where: { id },
        include: { seller: true },
      });
      if (p) return mapProduct(p);
    } catch {
      /* fall back to mock */
    }
  }
  return productById[id] ?? null;
}

/** A few sample reviews derived from the product's rating (until real reviews land). */
export function sampleReviews(product: Product) {
  const names = ["Ananya", "Rohan", "Priya", "Vikram", "Sara"];
  const blurbs = [
    "Exactly as shown. Great quality for the price!",
    "Fast delivery and the finish feels premium.",
    "Bought after seeing it in a reel — totally worth it.",
    "Good value. Would buy again.",
    "Looks even better in person.",
  ];
  const count = 3;
  return Array.from({ length: count }, (_, i) => ({
    id: `${product.id}_rv_${i}`,
    name: names[i % names.length],
    rating: Math.max(3, Math.round(product.rating)),
    body: blurbs[i % blurbs.length],
  }));
}
