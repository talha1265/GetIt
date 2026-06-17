"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Music2,
  Send,
  Star,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Media } from "@/components/ui/Media";
import { Price } from "@/components/ui/Price";
import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { BuyButton } from "@/components/commerce/BuyButton";
import type { Reel } from "@/lib/types";
import { cn, formatCount } from "@/lib/utils";

function Action({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-white transition active:scale-90"
    >
      <span className={cn(active && "text-like")}>{icon}</span>
      <span className="text-[11px] font-semibold drop-shadow">{label}</span>
    </button>
  );
}

export function ReelCard({ reel }: { reel: Reel }) {
  const [liked, setLiked] = useState(!!reel.liked);
  const likeCount =
    reel.likes + (liked && !reel.liked ? 1 : 0) - (!liked && reel.liked ? 1 : 0);

  return (
    <section className="snap-item relative h-full w-full overflow-hidden bg-black">
      {/* video poster (real video lands in Phase 3) */}
      <Media
        seed={reel.id}
        label={reel.caption}
        rounded="rounded-none"
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

      {/* right action rail */}
      <div className="absolute bottom-36 right-3 z-10 flex flex-col items-center gap-5">
        <Action
          icon={
            <Heart
              className="h-8 w-8"
              fill={liked ? "currentColor" : "none"}
              strokeWidth={1.8}
            />
          }
          label={formatCount(likeCount)}
          active={liked}
          onClick={() => setLiked((v) => !v)}
        />
        <Action
          icon={<MessageCircle className="h-8 w-8 -scale-x-100" strokeWidth={1.8} />}
          label={formatCount(reel.comments)}
        />
        <Action
          icon={<Star className="h-8 w-8" strokeWidth={1.8} />}
          label={formatCount(reel.reviewCount)}
        />
        <Action
          icon={<Send className="h-8 w-8" strokeWidth={1.8} />}
          label={formatCount(reel.shares)}
        />
        <button className="text-white">
          <MoreVertical className="h-7 w-7" strokeWidth={1.8} />
        </button>
      </div>

      {/* bottom content: author + caption + product bar */}
      <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 p-3 pb-4 text-white">
        <div className="flex items-center gap-2.5 pr-16">
          <Avatar user={reel.author} size="md" />
          <span className="text-sm font-semibold">{reel.author.username}</span>
          <Button
            variant="outline"
            size="sm"
            className="border-white/70 bg-transparent text-white hover:bg-white/10"
          >
            Follow
          </Button>
        </div>
        <p className="line-clamp-2 pr-16 text-sm leading-snug">{reel.caption}</p>
        <div className="flex items-center gap-1.5 pr-16 text-xs text-white/80">
          <Music2 className="h-3.5 w-3.5" />
          <span className="truncate">Original audio · {reel.author.username}</span>
        </div>

        {/* shoppable product bar with Add to cart + Buy */}
        <div className="flex items-center gap-3 rounded-2xl bg-white/12 p-2.5 backdrop-blur-md">
          <Media
            seed={reel.product.id}
            label={reel.product.title}
            className="h-12 w-12 shrink-0"
            rounded="rounded-[0.75rem]"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{reel.product.title}</p>
            <Price
              pricePaise={reel.product.pricePaise}
              size="sm"
              className="[&>span:first-child]:text-white"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <AddToCartButton
              product={reel.product}
              size="sm"
              label="Cart"
              variant="outline"
            />
            <BuyButton product={reel.product} size="sm" className="bg-white text-black" />
          </div>
        </div>
      </div>
    </section>
  );
}
