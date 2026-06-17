import { cn } from "@/lib/utils";

type Tone = "neutral" | "cashback" | "accent" | "danger" | "dark";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-muted-strong",
  cashback: "bg-cashback/12 text-cashback",
  accent: "bg-accent/12 text-accent",
  danger: "bg-danger/12 text-danger",
  dark: "bg-primary text-primary-foreground",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
