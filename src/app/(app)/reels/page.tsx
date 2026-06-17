import { ReelCard } from "@/components/reels/ReelCard";
import { reels } from "@/lib/mock/data";

export default function ReelsPage() {
  return (
    <div className="snap-y-feed no-scrollbar h-full overflow-y-auto bg-black">
      {reels.map((reel) => (
        <ReelCard key={reel.id} reel={reel} />
      ))}
    </div>
  );
}
