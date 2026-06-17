import { BadgePercent, ImagePlus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { users } from "@/lib/mock/data";

export function CashbackPrompt() {
  return (
    <section className="px-4 py-3">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-card)]">
        <Avatar user={users.you} size="md" />
        <button className="flex-1 rounded-full border border-border bg-surface-muted px-4 py-2 text-left text-sm text-muted">
          Post what you bought…
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ImagePlus className="h-5 w-5" strokeWidth={1.9} />
        </button>
      </div>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-cashback">
        <BadgePercent className="h-4 w-4" />
        Earn 5% cashback every time someone buys from your post
      </p>
    </section>
  );
}
