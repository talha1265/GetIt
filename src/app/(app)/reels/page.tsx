import { ReelCard } from "@/components/reels/ReelCard";
import { getReels } from "@/lib/data/feed";

export default async function ReelsPage() {
  const reels = await getReels();
  return (
    <div className="snap-y-feed no-scrollbar h-full overflow-y-auto bg-black">
      {reels.map((reel) => (
        <ReelCard key={reel.id} reel={reel} />
      ))}
    </div>
  );
}
