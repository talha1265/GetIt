"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clapperboard, PlusSquare, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart, selectCount } from "@/lib/store/cart";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/reels", label: "Reels", icon: Clapperboard },
  { href: "/create", label: "Create", icon: PlusSquare, center: true },
  { href: "/cart", label: "Cart", icon: ShoppingBag, cart: true },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const count = useCart(selectCount);

  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-surface/90 shadow-[var(--shadow-nav)] backdrop-blur-md">
      <ul className="flex h-16 items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon, ...flags }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const center = "center" in flags && flags.center;
          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                aria-label={label}
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5"
              >
                {center ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                ) : (
                  <span className="relative">
                    <Icon
                      className={cn(
                        "h-[26px] w-[26px] transition",
                        active ? "text-foreground" : "text-muted",
                      )}
                      strokeWidth={active ? 2.4 : 1.8}
                      fill={active && "cart" in flags && flags.cart ? "currentColor" : "none"}
                    />
                    {"cart" in flags && flags.cart && count > 0 && (
                      <span className="absolute -right-2 -top-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-like px-1 text-[10px] font-bold text-white ring-2 ring-surface">
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
