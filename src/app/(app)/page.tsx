import { StoriesBar } from "@/components/feed/StoriesBar";
import { CategoryStrip } from "@/components/feed/CategoryStrip";
import { AdsHero } from "@/components/feed/AdsHero";
import { SocialBuysFeed } from "@/components/feed/SocialBuysFeed";
import { CashbackPrompt } from "@/components/feed/CashbackPrompt";
import { PostCard } from "@/components/feed/PostCard";
import { ReelsRail } from "@/components/feed/ReelsRail";
import {
  banners,
  categories,
  posts,
  reels,
  socialBuys,
  stories,
} from "@/lib/mock/data";

export default function HomePage() {
  return (
    <div className="pb-4">
      <StoriesBar stories={stories} />
      <CategoryStrip categories={categories} />
      <AdsHero banners={banners} />
      <SocialBuysFeed buys={socialBuys} />
      <CashbackPrompt />
      <PostCard post={posts[0]} />
      <ReelsRail reels={reels} />
      {posts.slice(1).map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
