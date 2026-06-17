import { Plus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { Story } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StoriesBar({ stories }: { stories: Story[] }) {
  return (
    <section className="border-b border-border">
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 py-3">
        {stories.map((story) => (
          <button
            key={story.id}
            className="flex w-[68px] shrink-0 flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "relative rounded-full p-[2.5px]",
                story.isOwn
                  ? "bg-border-strong"
                  : story.seen
                    ? "bg-border-strong"
                    : "story-ring",
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
          </button>
        ))}
      </div>
    </section>
  );
}
