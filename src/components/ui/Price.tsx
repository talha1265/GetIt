import { cn, formatPrice } from "@/lib/utils";

export function Price({
  pricePaise,
  mrpPaise,
  className,
  size = "md",
}: {
  pricePaise: number;
  mrpPaise?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const hasDiscount = mrpPaise && mrpPaise > pricePaise;
  const off = hasDiscount
    ? Math.round(((mrpPaise! - pricePaise) / mrpPaise!) * 100)
    : 0;
  const priceSize =
    size === "lg" ? "text-lg" : size === "sm" ? "text-sm" : "text-base";

  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span className={cn("font-bold tracking-tight", priceSize)}>
        {formatPrice(pricePaise)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-xs text-muted line-through">
            {formatPrice(mrpPaise!)}
          </span>
          <span className="text-xs font-semibold text-cashback">{off}% off</span>
        </>
      )}
    </span>
  );
}
