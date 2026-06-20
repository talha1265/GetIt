"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/store/cart";
import type { ItemSource, Product } from "@/lib/types";

export function AddToCartButton({
  product,
  variant = "outline",
  size = "sm",
  fullWidth,
  label = "Add",
  source = "DIRECT",
  sourceId,
}: {
  product: Product;
  variant?: "outline" | "primary" | "accent";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  label?: string;
  source?: ItemSource;
  sourceId?: string;
}) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={() => {
        addItem(product, { source, sourceId });
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" /> {label}
        </>
      )}
    </Button>
  );
}
