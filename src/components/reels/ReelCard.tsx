"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Music2,
  Send,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Media } from "@/components/ui/Media";
import { Price } from "@/components/ui/Price";
import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { BuyButton } from "@/components/commerce/BuyButton";
import { CommentSheet } from "@/components/social/CommentSheet";
import { useSocial } from "@/lib/store/social";
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
      className="flex flex-col items-center gap-1.5 text-white transition active:scale-90"
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md",
          active && "text-like",
        )}
      >
        {icon}
      </span>
      <span className="text-[11px] font-semibold drop-shadow">{label}</span>
    </button>
  );
}

export function ReelCard({ reel }: { reel: Reel }) {
  const commentKey = `reel:${reel.id}`;
  const liked = useSocial((s) => !!s.likedReels[reel.id]);
  const following = useSocial((s) => !!s.follows[reel.author.username]);
  const commentExtra = useSocial((s) => s.comments[commentKey]?.length ?? 0);
  const toggleLike = useSocial((s) => s.toggleLikeReel);
  const toggleFollow = useSocial((s) => s.toggleFollow);
  const [muted, setMuted] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const likeCount = reel.likes + (liked ? 1 : 0);

  // Play only while the reel is on screen.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) el.play().catch(() => {});
          else el.pause();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  return (
    <section className="snap-item relative h-full w-full overflow-hidden bg-black">
      {reel.videoUrl ? (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.posterUrl || undefined}
          muted
          loop
          playsInline
          preload="metadata"
          onClick={() => setMuted((m) => !m)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Media
          seed={reel.id}
          src={reel.posterUrl}
          label={reel.caption}
          rounded="rounded-none"
          className="absolute inset-0 h-full w-full"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

      {/* mute toggle */}
      {reel.videoUrl && (
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      )}

      {/* right action rail */}
      <div className="absolute bottom-36 right-3 z-10 flex flex-col items-center gap-5">
        <Action
          icon={
            <Heart
              className="h-6 w-6"
              fill={liked ? "currentColor" : "none"}
              strokeWidth={1.8}
            />
          }
          label={formatCount(likeCount)}
          active={liked}
          onClick={() => toggleLike(reel.id)}
        />
        <Action
          icon={<MessageCircle className="h-6 w-6 -scale-x-100" strokeWidth={1.8} />}
          label={formatCount(reel.comments + commentExtra)}
          onClick={() => setSheetOpen(true)}
        />
        <Action
          icon={<Star className="h-6 w-6" strokeWidth={1.8} />}
          label={formatCount(reel.reviewCount)}
        />
        <Action
          icon={<Send className="h-6 w-6" strokeWidth={1.8} />}
          label={formatCount(reel.shares)}
        />
        <button className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md">
          <MoreVertical className="h-6 w-6" strokeWidth={1.8} />
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
            onClick={() => toggleFollow(reel.author.username)}
            className={cn(
              "border-white/70 bg-transparent text-white hover:bg-white/10",
              following && "border-white/30 text-white/70",
            )}
          >
            {following ? "Following" : "Follow"}
          </Button>
        </div>
        <p className="line-clamp-2 pr-16 text-sm leading-snug">{reel.caption}</p>
        <div className="flex items-center gap-1.5 pr-16 text-xs text-white/80">
          <Music2 className="h-3.5 w-3.5" />
          <span className="truncate">Original audio · {reel.author.username}</span>
        </div>

        {/* shoppable product bar with Add to cart + Buy */}
        <div className="flex items-center gap-3 rounded-2xl bg-white/12 p-2.5 backdrop-blur-md">
          <Link
            href={`/product/${reel.product.id}`}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <Media
              seed={reel.product.id}
              src={reel.product.imageUrl}
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
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <AddToCartButton
              product={reel.product}
              size="sm"
              label="Cart"
              variant="outline"
              source="REEL"
              sourceId={reel.id}
            />
            <BuyButton
              product={reel.product}
              size="sm"
              className="bg-white text-black"
              source="REEL"
              sourceId={reel.id}
            />
          </div>
        </div>
      </div>

      <CommentSheet open={sheetOpen} onClose={() => setSheetOpen(false)} commentKey={commentKey} />
    </section>
  );
}
