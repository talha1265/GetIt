import { Star } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { Price } from "@/components/ui/Price";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { BuyButton } from "@/components/commerce/BuyButton";
import type { Product } from "@/lib/types";
import { formatCount } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
      <Media
        seed={product.id}
        src={product.imageUrl}
        label={product.title}
        rounded="rounded-none"
        className="aspect-square w-full"
      />
      <div className="space-y-1.5 p-2.5">
        <p className="line-clamp-2 text-xs font-medium leading-snug">{product.title}</p>
        <div className="flex items-center gap-1 text-[11px] text-muted">
          <Star className="h-3 w-3 fill-current text-amber-400" />
          {product.rating} · {formatCount(product.ratingCount)}
        </div>
        <Price pricePaise={product.pricePaise} mrpPaise={product.mrpPaise} size="sm" />
        <div className="flex gap-1.5 pt-0.5">
          <AddToCartButton product={product} fullWidth />
          <BuyButton product={product} size="sm" fullWidth />
        </div>
      </div>
    </article>
  );
}
