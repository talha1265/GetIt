import "server-only";
import { prisma, hasDatabase } from "@/lib/db";
import { relativeTime } from "@/lib/utils";
import type {
  Banner,
  Category,
  Post,
  Product,
  Reel,
  SocialBuy,
  Story,
  User,
} from "@/lib/types";
import * as mock from "@/lib/mock/data";

/**
 * Single source of feed data for the app. When a database is connected the
 * catalog/social content is read from Postgres; otherwise we serve the mock
 * fixtures so the UI stays renderable in local dev. Component props are
 * identical either way.
 *
 * Stories and "bought by people you follow" depend on the signed-in user's
 * follow graph and are served from mock until that wiring lands (later phase).
 */

/**
 * Run a DB-backed loader, falling back to mock data if no DB is configured or
 * the database is unreachable (e.g. placeholder DATABASE_URL in local dev).
 */
async function withDb<T>(label: string, loader: () => Promise<T>, fallback: T): Promise<T> {
  if (!hasDatabase) return fallback;
  try {
    return await loader();
  } catch (err) {
    console.warn(`[data] ${label}: DB unavailable, using mock fallback.`, (err as Error)?.message);
    return fallback;
  }
}

// --- Prisma row -> view-model mappers ------------------------------------
type DbUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  verified: boolean;
  role: "USER" | "SELLER" | "ADMIN";
};

function mapUser(u: DbUser): User {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl ?? "",
    isSeller: u.role === "SELLER",
    verified: u.verified,
  };
}

type DbProduct = {
  id: string;
  title: string;
  pricePaise: number;
  mrpPaise: number | null;
  imageUrls: string[];
  rating: number;
  ratingCount: number;
  categoryId: string;
  seller: DbUser;
};

export function mapProduct(p: DbProduct): Product {
  return {
    id: p.id,
    title: p.title,
    pricePaise: p.pricePaise,
    mrpPaise: p.mrpPaise ?? undefined,
    imageUrl: p.imageUrls[0] ?? "",
    rating: p.rating,
    ratingCount: p.ratingCount,
    seller: mapUser(p.seller),
    categoryId: p.categoryId,
  };
}

// --- Public API ----------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  return withDb(
    "getCategories",
    async () => {
      const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
      return rows.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }));
    },
    mock.categories,
  );
}

export async function getBanners(): Promise<Banner[]> {
  // Ads are campaign-managed; mock for now in every environment.
  return mock.banners;
}

export async function getStories(): Promise<Story[]> {
  return mock.stories; // depends on follow graph — mock until session wiring.
}

export async function getSocialBuys(): Promise<SocialBuy[]> {
  return mock.socialBuys; // depends on follow graph — mock until session wiring.
}

export async function getPosts(): Promise<Post[]> {
  return withDb<Post[]>(
    "getPosts",
    async () => {
      const rows = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          author: true,
          taggedProduct: { include: { seller: true } },
        },
      });
      return rows.map((p) => ({
        id: p.id,
        author: mapUser(p.author),
        imageUrl: p.imageUrls[0] ?? "",
        caption: p.caption,
        likes: p.likeCount,
        comments: p.commentCount,
        taggedProduct: p.taggedProduct ? mapProduct(p.taggedProduct) : undefined,
        createdAt: relativeTime(p.createdAt),
      }));
    },
    mock.posts,
  );
}

export async function getReels(): Promise<Reel[]> {
  return withDb<Reel[]>(
    "getReels",
    async () => {
      const rows = await prisma.reel.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          author: true,
          product: { include: { seller: true } },
        },
      });
      return rows.map((r) => ({
        id: r.id,
        author: mapUser(r.author),
        posterUrl: r.posterUrl ?? "",
        videoUrl: r.videoUrl,
        caption: r.caption,
        product: mapProduct(r.product),
        likes: r.likeCount,
        comments: r.commentCount,
        shares: r.shareCount,
        reviewCount: r.reviewCount,
      }));
    },
    mock.reels,
  );
}
