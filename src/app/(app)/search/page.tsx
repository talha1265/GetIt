"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { products, categories } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

function SearchInner() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [category, setCategory] = useState<string | null>(sp.get("category"));

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      const matchesText =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.seller.displayName.toLowerCase().includes(term);
      const matchesCat = !category || p.categoryId === category;
      return matchesText && matchesCat;
    });
  }, [q, category]);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3">
          <Search className="h-4 w-4 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, brands…"
            className="h-10 flex-1 bg-transparent text-sm outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear">
              <X className="h-4 w-4 text-muted" />
            </button>
          )}
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCategory(null)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold",
              !category ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-strong",
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id === category ? null : c.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold",
                category === c.id
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-strong",
              )}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto p-3">
        {results.length === 0 ? (
          <p className="pt-10 text-center text-sm text-muted">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
