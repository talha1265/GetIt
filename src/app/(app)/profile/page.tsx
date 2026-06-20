import Link from "next/link";
import { BadgePercent, Grid3x3, Package, Settings, Store } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LocalPostTiles } from "@/components/feed/LocalPosts";
import { users, posts, reels } from "@/lib/mock/data";
import { formatPrice } from "@/lib/utils";

const me = { ...users.you, displayName: "You", username: "you" };

export default function ProfilePage() {
  const tiles = [...posts, ...reels];
  return (
    <div className="pb-4">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold">{me.username}</h1>
        <button aria-label="Settings" className="text-muted-strong">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-5 px-4">
        <Avatar user={me} size="lg" className="h-[72px] w-[72px] text-base" />
        <div className="flex flex-1 justify-around text-center">
          {[
            ["12", "Posts"],
            ["1.4k", "Followers"],
            ["320", "Following"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="text-base font-bold">{n}</p>
              <p className="text-xs text-muted">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        <p className="text-sm font-semibold">Your Name</p>
        <p className="text-sm text-muted">Shopping the feed, one reel at a time ✨</p>
      </div>

      {/* cashback wallet */}
      <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-cashback/20 bg-cashback/8 p-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cashback/15 text-cashback">
          <BadgePercent className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Cashback balance</p>
          <p className="text-xs text-muted">Earned from your shoppable posts</p>
        </div>
        <span className="text-lg font-bold text-cashback">{formatPrice(124500)}</span>
      </div>

      <div className="flex gap-2 px-4 pt-3">
        <Link href="/orders" className="flex-1">
          <Button variant="outline" size="md" fullWidth>
            <Package className="h-4 w-4" /> Your orders
          </Button>
        </Link>
        <Button variant="primary" size="md" fullWidth>
          <Store className="h-4 w-4" /> Become a seller
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 border-y border-border py-2.5 text-foreground">
        <Grid3x3 className="h-5 w-5" />
        <Badge tone="neutral">Posts &amp; Reels</Badge>
      </div>

      <LocalPostTiles />

      <div className="grid grid-cols-3 gap-0.5 p-0.5">
        {tiles.map((t) => (
          <Media
            key={t.id}
            seed={t.id}
            src={"imageUrl" in t ? t.imageUrl : t.posterUrl}
            rounded="rounded-none"
            className="aspect-square"
          />
        ))}
      </div>
    </div>
  );
}
