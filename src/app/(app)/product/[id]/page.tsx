import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgePercent, ShieldCheck, Star, Truck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Media } from "@/components/ui/Media";
import { Price } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { BuyButton } from "@/components/commerce/BuyButton";
import { getProduct, sampleReviews } from "@/lib/data/product";
import { cashbackPaise, formatCount, formatPrice } from "@/lib/utils";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const reviews = sampleReviews(product);
  const cashback = cashbackPaise(product.pricePaise);

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto pb-4">
        {/* image */}
        <div className="relative">
          <Media
            seed={product.id}
            src={product.imageUrl}
            label={product.title}
            rounded="rounded-none"
            className="aspect-square w-full"
          />
          <Link
            href="/"
            className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <h1 className="text-lg font-bold leading-snug">{product.title}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {product.rating}
              </span>
              <span className="text-muted">{formatCount(product.ratingCount)} ratings</span>
            </div>
          </div>

          <Price pricePaise={product.pricePaise} mrpPaise={product.mrpPaise} size="lg" />

          <Badge tone="cashback">
            <BadgePercent className="h-3.5 w-3.5" /> Earn {formatPrice(cashback)} cashback when shared
          </Badge>

          {/* seller */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface p-3">
            <Avatar user={product.seller} size="md" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{product.seller.displayName}</p>
              <p className="text-xs text-muted">Seller</p>
            </div>
            {product.seller.verified && <Badge tone="accent">Verified</Badge>}
          </div>

          {/* assurances */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-xl bg-surface-muted p-2.5">
              <Truck className="h-4 w-4 text-accent" /> Free delivery
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-surface-muted p-2.5">
              <ShieldCheck className="h-4 w-4 text-accent" /> Secure payment
            </div>
          </div>

          <div>
            <h2 className="mb-1 text-sm font-bold">About this product</h2>
            <p className="text-sm leading-relaxed text-muted-strong">
              {product.title} from {product.seller.displayName}. Hand-picked for the
              getIt community — quality checked, ships fast, and fully covered by our
              buyer protection.
            </p>
          </div>

          {/* reviews */}
          <div>
            <h2 className="mb-2 text-sm font-bold">Ratings &amp; reviews</h2>
            <div className="space-y-2.5">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-surface p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{r.name}</span>
                    <span className="flex items-center gap-0.5 text-xs font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {r.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-strong">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* sticky buy bar */}
      <div className="flex items-center gap-2 border-t border-border bg-surface p-3">
        <AddToCartButton product={product} size="lg" label="Add to cart" fullWidth variant="outline" />
        <BuyButton product={product} size="lg" fullWidth />
      </div>
    </div>
  );
}
