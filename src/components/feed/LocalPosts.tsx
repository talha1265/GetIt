"use client";

import Link from "next/link";
import { PostCard } from "@/components/feed/PostCard";
import { Media } from "@/components/ui/Media";
import { usePosts } from "@/lib/store/posts";
import { users, productById } from "@/lib/mock/data";
import { relativeTime } from "@/lib/utils";
import type { Post } from "@/lib/types";

const me = { ...users.you, displayName: "You", username: "you" };

/** Renders the user's locally-created posts as full feed cards (home). */
export function LocalPostsFeed() {
  const posts = usePosts((s) => s.posts);
  if (posts.length === 0) return null;

  return (
    <>
      {posts.map((p) => {
        const post: Post = {
          id: p.id,
          author: me,
          imageUrl: p.imageUrl,
          caption: p.caption,
          likes: 0,
          comments: 0,
          taggedProduct: p.taggedProductId ? productById[p.taggedProductId] : undefined,
          createdAt: relativeTime(p.createdAt),
        };
        return <PostCard key={p.id} post={post} />;
      })}
    </>
  );
}

/** Renders the user's locally-created posts as grid tiles (profile). */
export function LocalPostTiles() {
  const posts = usePosts((s) => s.posts);
  if (posts.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-0.5 p-0.5">
      {posts.map((p) => (
        <Link key={p.id} href="/">
          <Media seed={p.id} src={p.imageUrl} rounded="rounded-none" className="aspect-square" />
        </Link>
      ))}
    </div>
  );
}
