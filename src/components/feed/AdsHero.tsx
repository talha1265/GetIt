"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Banner } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AdsHero({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % banners.length),
      4000,
    );
    return () => clearInterval(id);
  }, [banners.length]);

  return (
    <section className="px-4 py-3">
      <div className="relative h-[112px] overflow-hidden rounded-2xl">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className={cn(
              "absolute inset-0 flex flex-col justify-center gap-1 p-4 text-white transition-opacity duration-700",
              i === active ? "opacity-100" : "opacity-0",
            )}
            style={{ background: b.gradient }}
            aria-hidden={i !== active}
          >
            <span className="text-[11px] font-medium uppercase tracking-widest text-white/70">
              Sponsored
            </span>
            <h3 className="text-lg font-bold leading-tight">{b.title}</h3>
            <p className="text-xs text-white/85">{b.subtitle}</p>
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              {b.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        ))}
        <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              aria-label={`Go to banner ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "h-1.5 rounded-full bg-white transition-all",
                i === active ? "w-4 opacity-100" : "w-1.5 opacity-50",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
