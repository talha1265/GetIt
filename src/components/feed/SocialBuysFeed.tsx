import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Media } from "@/components/ui/Media";
import { Price } from "@/components/ui/Price";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import type { SocialBuy } from "@/lib/types";

export function SocialBuysFeed({ buys }: { buys: SocialBuy[] }) {
  return (
    <section className="py-3">
      <div className="flex items-center justify-between px-4 pb-2.5">
        <h2 className="text-sm font-bold">Bought by people you follow</h2>
        <button className="text-xs font-semibold text-accent">See all</button>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
        {buys.map((buy) => (
          <article
            key={buy.id}
            className="w-[180px] shrink-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]"
          >
            <Link href={`/product/${buy.product.id}`} className="relative block">
              <Media
                seed={buy.product.id}
                src={buy.product.imageUrl}
                label={buy.product.title}
                rounded="rounded-none"
                className="h-[120px] w-full"
              />
              <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/45 py-1 pl-1 pr-2.5 text-white backdrop-blur">
                <Avatar user={buy.buyer} size="sm" className="h-5 w-5 text-[9px] ring-0" />
                <span className="text-[11px] font-medium">
                  {buy.buyer.displayName.split(" ")[0]} bought
                </span>
              </div>
            </Link>
            <div className="space-y-2 p-2.5">
              <Link href={`/product/${buy.product.id}`} className="block">
                <p className="line-clamp-2 text-xs font-medium leading-snug">
                  {buy.product.title}
                </p>
              </Link>
              <Price
                pricePaise={buy.product.pricePaise}
                mrpPaise={buy.product.mrpPaise}
                size="sm"
              />
              <AddToCartButton product={buy.product} fullWidth />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
