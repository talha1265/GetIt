import Link from "next/link";
import { Heart, Play } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { Price } from "@/components/ui/Price";
import type { Reel } from "@/lib/types";
import { formatCount } from "@/lib/utils";

export function ReelsRail({ reels }: { reels: Reel[] }) {
  return (
    <section className="py-3">
      <div className="flex items-center justify-between px-4 pb-2.5">
        <h2 className="flex items-center gap-1.5 text-sm font-bold">
          <Play className="h-4 w-4 text-accent" fill="currentColor" /> Reels for you
        </h2>
        <Link href="/reels" className="text-xs font-semibold text-accent">
          Watch all
        </Link>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
        {reels.map((reel) => (
          <Link
            key={reel.id}
            href="/reels"
            className="group relative w-[148px] shrink-0 overflow-hidden rounded-2xl"
          >
            <Media
              seed={reel.id}
              src={reel.posterUrl || reel.product.imageUrl}
              label={reel.caption}
              rounded="rounded-2xl"
              className="h-[230px] w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 text-xs font-semibold text-white">
              <Heart className="h-3.5 w-3.5" fill="currentColor" />
              {formatCount(reel.likes)}
            </span>
            <div className="absolute inset-x-2 bottom-2 text-white">
              <p className="line-clamp-1 text-[11px] font-medium">
                {reel.product.title}
              </p>
              <Price
                pricePaise={reel.product.pricePaise}
                size="sm"
                className="[&>span]:text-white"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
