/** Tiny classname joiner (truthy strings only). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Money is stored in minor units (paise). Format to ₹ for display. */
export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

/** Compact counts: 1200 -> "1.2k", 1_500_000 -> "1.5m". */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}m`;
}

/** 5% cashback in paise for a given price (also paise). */
export function cashbackPaise(pricePaise: number, rate = 0.05): number {
  return Math.round(pricePaise * rate);
}

/** Stable string hash (FNV-1a-ish) used for deterministic placeholder visuals. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Deterministic premium gradient (as an inline CSS background) derived from a
 * seed. Used as a placeholder until real R2-hosted media is wired in.
 */
export function seededGradient(seed: string): string {
  const h = hashString(seed);
  const base = h % 360;
  const a = `hsl(${base} 70% 62%)`;
  const b = `hsl(${(base + 38) % 360} 72% 48%)`;
  const c = `hsl(${(base + 320) % 360} 65% 40%)`;
  return `linear-gradient(135deg, ${a} 0%, ${b} 52%, ${c} 100%)`;
}

/** Two uppercase initials from a display name. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
