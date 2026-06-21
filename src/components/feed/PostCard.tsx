"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Media } from "@/components/ui/Media";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { CommentSheet } from "@/components/social/CommentSheet";
import { useSocial } from "@/lib/store/social";
import type { Post } from "@/lib/types";
import { cn, formatCount } from "@/lib/utils";

export function PostCard({ post }: { post: Post }) {
  const commentKey = `post:${post.id}`;
  const liked = useSocial((s) => !!s.likedPosts[post.id]);
  const saved = useSocial((s) => !!s.saved[post.id]);
  const commentExtra = useSocial((s) => s.comments[commentKey]?.length ?? 0);
  const toggleLike = useSocial((s) => s.toggleLikePost);
  const toggleSave = useSocial((s) => s.toggleSave);
  const [sheetOpen, setSheetOpen] = useState(false);
  const likeCount = post.likes + (liked ? 1 : 0);

  return (
    <article className="mx-3 mb-3 overflow-hidden rounded-3xl border border-border bg-surface pb-3 shadow-[var(--shadow-card)]">
      {/* header */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Avatar user={post.author} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-sm font-semibold">
              {post.author.username}
            </span>
            {post.author.verified && (
              <span className="text-accent" aria-label="verified">
                ✔
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted">{post.createdAt} ago</span>
        </div>
        <button aria-label="More" className="text-muted">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* media */}
      <div className="relative px-3">
        <Media
          seed={post.id}
          src={post.imageUrl}
          label={post.caption}
          rounded="rounded-2xl"
          className="aspect-square w-full"
        />
        {post.taggedProduct && (
          <Badge tone="dark" className="absolute bottom-3 left-6 bg-black/55 backdrop-blur">
            🛍 Shoppable
          </Badge>
        )}
      </div>

      {/* actions */}
      <div className="flex items-center gap-4 px-4 pt-3">
        <button
          aria-label="Like"
          onClick={() => toggleLike(post.id)}
          className="transition active:scale-90"
        >
          <Heart
            className={cn("h-7 w-7", liked ? "text-like" : "text-foreground")}
            fill={liked ? "currentColor" : "none"}
            strokeWidth={1.8}
          />
        </button>
        <button aria-label="Comment" onClick={() => setSheetOpen(true)}>
          <MessageCircle className="h-7 w-7 -scale-x-100" strokeWidth={1.8} />
        </button>
        <button aria-label="Share">
          <Send className="h-[26px] w-[26px]" strokeWidth={1.8} />
        </button>
        <button
          aria-label="Save"
          onClick={() => toggleSave(post.id)}
          className="ml-auto"
        >
          <Bookmark
            className="h-7 w-7"
            fill={saved ? "currentColor" : "none"}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* meta */}
      <div className="px-4 pt-2">
        <p className="text-sm font-semibold">{formatCount(likeCount)} likes</p>
        <p className="mt-1 text-sm leading-snug">
          <span className="font-semibold">{post.author.username}</span>{" "}
          {post.caption}
        </p>
        <button onClick={() => setSheetOpen(true)} className="mt-1 text-sm text-muted">
          View all {formatCount(post.comments + commentExtra)} comments
        </button>
      </div>

      {/* tagged product shopping row */}
      {post.taggedProduct && (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-border bg-surface-muted p-2.5">
          <Link
            href={`/product/${post.taggedProduct.id}`}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
          <Media
            seed={post.taggedProduct.id}
            src={post.taggedProduct.imageUrl}
            label={post.taggedProduct.title}
            className="h-14 w-14 shrink-0"
            rounded="rounded-[0.75rem]"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">
              {post.taggedProduct.title}
            </p>
            <Price
              pricePaise={post.taggedProduct.pricePaise}
              mrpPaise={post.taggedProduct.mrpPaise}
              size="sm"
            />
            <p className="mt-0.5 text-[11px] font-medium text-cashback">
              5% cashback to {post.author.username}
            </p>
          </div>
          </Link>
          <AddToCartButton
            product={post.taggedProduct}
            source="POST"
            sourceId={post.id}
          />
        </div>
      )}

      <CommentSheet open={sheetOpen} onClose={() => setSheetOpen(false)} commentKey={commentKey} />
    </article>
  );
}
