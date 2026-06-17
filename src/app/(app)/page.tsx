import { StoriesBar } from "@/components/feed/StoriesBar";
import { CategoryStrip } from "@/components/feed/CategoryStrip";
import { AdsHero } from "@/components/feed/AdsHero";
import { SocialBuysFeed } from "@/components/feed/SocialBuysFeed";
import { CashbackPrompt } from "@/components/feed/CashbackPrompt";
import { PostCard } from "@/components/feed/PostCard";
import { ReelsRail } from "@/components/feed/ReelsRail";
import {
  getBanners,
  getCategories,
  getPosts,
  getReels,
  getSocialBuys,
  getStories,
} from "@/lib/data/feed";

export default async function HomePage() {
  const [stories, categories, banners, socialBuys, posts, reels] =
    await Promise.all([
      getStories(),
      getCategories(),
      getBanners(),
      getSocialBuys(),
      getPosts(),
      getReels(),
    ]);

  return (
    <div className="pb-4">
      <StoriesBar stories={stories} />
      <CategoryStrip categories={categories} />
      <AdsHero banners={banners} />
      <SocialBuysFeed buys={socialBuys} />
      <CashbackPrompt />
      {posts[0] && <PostCard post={posts[0]} />}
      <ReelsRail reels={reels} />
      {posts.slice(1).map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
