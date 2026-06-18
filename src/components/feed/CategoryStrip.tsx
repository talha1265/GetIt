import type { Category } from "@/lib/types";

export function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <section className="py-3">
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
        {categories.map((c) => (
          <button
            key={c.id}
            className="flex w-[64px] shrink-0 flex-col items-center gap-1.5"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-muted text-2xl transition active:scale-95">
              {c.emoji}
            </span>
            <span className="max-w-full truncate text-[11px] font-medium text-muted-strong">
              {c.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
