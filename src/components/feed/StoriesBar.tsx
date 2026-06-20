"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { Story } from "@/lib/types";
import { cn } from "@/lib/utils";

const storyImage = (username: string) =>
  `https://picsum.photos/seed/story_${username}/720/1280`;

export function StoriesBar({ stories }: { stories: Story[] }) {
  const viewable = stories.filter((s) => !s.isOwn);
  const [idx, setIdx] = useState<number | null>(null);

  const close = useCallback(() => setIdx(null), []);
  const next = useCallback(() => {
    setIdx((i) => (i === null ? i : i + 1 >= viewable.length ? null : i + 1));
  }, [viewable.length]);
  const prev = useCallback(() => {
    setIdx((i) => (i === null || i === 0 ? i : i - 1));
  }, []);

  // Auto-advance every 5s while a story is open.
  useEffect(() => {
    if (idx === null) return;
    const t = setTimeout(next, 5000);
    return () => clearTimeout(t);
  }, [idx, next]);

  const current = idx === null ? null : viewable[idx];

  return (
    <section>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 py-3">
        {stories.map((story) => {
          const inner = (
            <>
              <span
                className={cn(
                  "relative rounded-full p-[2.5px]",
                  story.isOwn || story.seen ? "bg-border-strong" : "story-ring",
                )}
              >
                <span className="block rounded-full bg-surface p-[2px]">
                  <Avatar user={story.user} size="lg" className="ring-0" />
                </span>
                {story.isOwn && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-accent text-white">
                    <Plus className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="max-w-full truncate text-[11px] text-muted-strong">
                {story.isOwn ? "Your story" : story.user.username}
              </span>
            </>
          );

          if (story.isOwn) {
            return (
              <Link key={story.id} href="/create" className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
                {inner}
              </Link>
            );
          }
          return (
            <button
              key={story.id}
              onClick={() => setIdx(viewable.findIndex((s) => s.id === story.id))}
              className="flex w-[68px] shrink-0 flex-col items-center gap-1.5"
            >
              {inner}
            </button>
          );
        })}
      </div>

      {/* Fullscreen story viewer */}
      {current && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col bg-black">
          {/* progress bars */}
          <div className="flex gap-1 px-3 pt-3">
            {viewable.map((s, i) => (
              <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
                <div
                  className={cn(
                    "h-full bg-white",
                    i < idx! ? "w-full" : i === idx ? "story-progress-fill" : "w-0",
                  )}
                />
              </div>
            ))}
          </div>

          {/* header */}
          <div className="flex items-center gap-2.5 px-3 py-3 text-white">
            <Avatar user={current.user} size="sm" />
            <span className="flex-1 text-sm font-semibold">{current.user.username}</span>
            <button onClick={close} aria-label="Close">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* media + tap zones */}
          <div className="relative flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={storyImage(current.user.username)}
              alt={`${current.user.username}'s story`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute inset-y-0 left-0 w-1/3"
            />
            <button
              onClick={next}
              aria-label="Next"
              className="absolute inset-y-0 right-0 w-2/3"
            />
          </div>
        </div>
      )}
    </section>
  );
}
