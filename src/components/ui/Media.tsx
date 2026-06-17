import { cn, seededGradient } from "@/lib/utils";

/**
 * Placeholder media tile. Renders a deterministic premium gradient derived from
 * `seed` (falling back from a real `src` when one exists). Swap `src` rendering
 * for next/image once R2-hosted media lands in Phase 3.
 */
export function Media({
  seed,
  src,
  label,
  className,
  rounded = "rounded-2xl",
}: {
  seed: string;
  src?: string;
  label?: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-muted",
        rounded,
        className,
      )}
      style={src ? undefined : { background: seededGradient(seed) }}
      role="img"
      aria-label={label ?? "media"}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label ?? ""} className="h-full w-full object-cover" />
      ) : (
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
      )}
    </div>
  );
}
