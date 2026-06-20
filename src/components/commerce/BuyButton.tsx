"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/store/cart";
import type { ItemSource, Product } from "@/lib/types";

/** Express buy: drops the item in the cart and jumps straight to checkout. */
export function BuyButton({
  product,
  size = "md",
  fullWidth,
  className,
  source = "DIRECT",
  sourceId,
}: {
  product: Product;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  source?: ItemSource;
  sourceId?: string;
}) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  return (
    <Button
      variant="buy"
      size={size}
      fullWidth={fullWidth}
      className={className}
      onClick={() => {
        addItem(product, { source, sourceId });
        router.push("/checkout");
      }}
    >
      Buy now
    </Button>
  );
}
