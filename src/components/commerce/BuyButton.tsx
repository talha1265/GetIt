"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/store/cart";
import type { Product } from "@/lib/types";

/** Express buy: drops the item in the cart and jumps to checkout (cart for now). */
export function BuyButton({
  product,
  size = "md",
  fullWidth,
  className,
}: {
  product: Product;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
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
        addItem(product);
        router.push("/cart");
      }}
    >
      Buy now
    </Button>
  );
}
