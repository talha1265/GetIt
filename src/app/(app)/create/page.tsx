import Link from "next/link";
import {
  BadgePercent,
  ChevronRight,
  Clapperboard,
  ImagePlus,
  Lock,
  Tag,
} from "lucide-react";
import { auth } from "@/auth";

const options = [
  {
    icon: ImagePlus,
    title: "New post",
    desc: "Share a photo, tag a product, earn 5% cashback",
    href: "/create/post" as string | undefined,
    sellerOnly: false,
  },
  {
    icon: Clapperboard,
    title: "New reel",
    desc: "Upload a product reel — auto-compressed before upload",
    href: "/create/reel",
    sellerOnly: true,
  },
  {
    icon: Tag,
    title: "List a product",
    desc: "Add a product to your shop",
    href: undefined as string | undefined,
    sellerOnly: true,
  },
];

export default async function CreatePage() {
  const session = await auth();
  const role = session?.user?.role;
  const isSeller = role === "SELLER" || role === "ADMIN";

  return (
    <div className="flex h-full flex-col px-4 py-5">
      <h1 className="text-xl font-bold">Create</h1>
      <p className="mt-1 text-sm text-muted">
        Posts are for everyone. Reels are uploaded by sellers.
      </p>

      <div className="mt-5 space-y-3">
        {options.map(({ icon: Icon, title, desc, href, sellerOnly }) => {
          const locked = sellerOnly && !isSeller;
          const enabled = Boolean(href) && !locked;

          const inner = (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {title}
                  {sellerOnly && (
                    <span className="rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                      Seller
                    </span>
                  )}
                </span>
                <span className="block text-xs text-muted">
                  {locked ? "Set up a seller account to unlock" : desc}
                </span>
              </span>
              {locked ? (
                <Lock className="h-4 w-4 text-muted" />
              ) : enabled ? (
                <ChevronRight className="h-5 w-5 text-muted" />
              ) : null}
            </>
          );

          const cls =
            "flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-[var(--shadow-card)] transition active:scale-[0.99]";

          if (enabled) {
            return (
              <Link key={title} href={href!} className={cls}>
                {inner}
              </Link>
            );
          }
          if (locked) {
            return (
              <Link key={title} href="/profile" className={`${cls} opacity-70`}>
                {inner}
              </Link>
            );
          }
          return (
            <button key={title} className={`${cls} opacity-60`}>
              {inner}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-2xl bg-cashback/8 p-3 text-cashback">
        <BadgePercent className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-xs font-medium">
          Every purchase made from your tagged post returns 5% cashback to your
          wallet. No seller account needed to earn.
        </p>
      </div>
    </div>
  );
}
