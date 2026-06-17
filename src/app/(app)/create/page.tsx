import { BadgePercent, Clapperboard, ImagePlus, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";

const options = [
  {
    icon: ImagePlus,
    title: "New post",
    desc: "Share a photo and tag a product",
  },
  {
    icon: Clapperboard,
    title: "New reel",
    desc: "Record or upload — auto-compressed before upload",
  },
  {
    icon: Tag,
    title: "List a product",
    desc: "Sellers only — add it to your shop",
  },
];

export default function CreatePage() {
  return (
    <div className="flex h-full flex-col px-4 py-5">
      <h1 className="text-xl font-bold">Create</h1>
      <p className="mt-1 text-sm text-muted">
        Post what you bought and earn cashback when others shop it.
      </p>

      <div className="mt-5 space-y-3">
        {options.map(({ icon: Icon, title, desc }) => (
          <button
            key={title}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-[var(--shadow-card)] transition active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted">
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">{title}</span>
              <span className="block text-xs text-muted">{desc}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-2xl bg-cashback/8 p-3 text-cashback">
        <BadgePercent className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-xs font-medium">
          Every purchase made from your tagged post returns 5% cashback to your
          wallet. No seller account needed to earn.
        </p>
      </div>

      <div className="mt-auto pt-5">
        <Button variant="primary" size="lg" fullWidth>
          Continue
        </Button>
      </div>
    </div>
  );
}
