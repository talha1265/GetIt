/**
 * Domain models for getIt. These mirror the eventual Prisma schema so that
 * components can switch from mock fixtures to real DB queries without changing
 * their props. Money is always in minor units (paise).
 */

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isSeller?: boolean;
  verified?: boolean;
}

export interface Story {
  id: string;
  user: User;
  seen?: boolean;
  /** "Your story" entry that opens the camera/create flow. */
  isOwn?: boolean;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  /** Tailwind gradient classes for the mock placeholder. */
  gradient: string;
  cta: string;
}

export interface Product {
  id: string;
  title: string;
  pricePaise: number;
  mrpPaise?: number;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  seller: User;
  categoryId: string;
}

/** "Someone you follow bought this" social-proof card. */
export interface SocialBuy {
  id: string;
  buyer: User;
  product: Product;
  boughtAt: string; // human label e.g. "2h ago"
}

export interface Post {
  id: string;
  author: User;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  liked?: boolean;
  /** Optional tagged product that makes the post cashback-eligible. */
  taggedProduct?: Product;
  createdAt: string;
}

export interface Reel {
  id: string;
  author: User;
  /** Poster image shown before/while the video loads (mock has no real video). */
  posterUrl: string;
  videoUrl?: string;
  caption: string;
  product: Product;
  likes: number;
  comments: number;
  shares: number;
  reviewCount: number;
  liked?: boolean;
}

export interface CartLine {
  productId: string;
  title: string;
  pricePaise: number;
  imageUrl: string;
  sellerName: string;
  qty: number;
}
