import { cn, initials, seededGradient } from "@/lib/utils";
import type { User } from "@/lib/types";

const sizes = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-sm",
} as const;

export function Avatar({
  user,
  size = "md",
  className,
}: {
  user: Pick<User, "displayName" | "username" | "avatarUrl">;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-surface",
        sizes[size],
        className,
      )}
      style={
        user.avatarUrl
          ? undefined
          : { background: seededGradient(user.username) }
      }
      aria-label={user.displayName}
    >
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        initials(user.displayName)
      )}
    </span>
  );
}
