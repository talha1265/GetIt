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

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const users: Record<string, User> = {
  you: { id: "u_you", username: "you", displayName: "You", avatarUrl: "" },
  aria: {
    id: "u_aria",
    username: "aria.styles",
    displayName: "Aria Mehta",
    avatarUrl: "",
    verified: true,
  },
  kabir: {
    id: "u_kabir",
    username: "kabir.fit",
    displayName: "Kabir Rao",
    avatarUrl: "",
  },
  nova: {
    id: "u_nova",
    username: "nova.home",
    displayName: "Nova Living",
    avatarUrl: "",
    isSeller: true,
    verified: true,
  },
  leo: { id: "u_leo", username: "leo.tech", displayName: "Leo Verma", avatarUrl: "" },
  mia: {
    id: "u_mia",
    username: "mia.glow",
    displayName: "Mia Kapoor",
    avatarUrl: "",
    verified: true,
  },
  zane: { id: "u_zane", username: "zane.kicks", displayName: "Zane D", avatarUrl: "" },
  isha: {
    id: "u_isha",
    username: "isha.decor",
    displayName: "Isha Sharma",
    avatarUrl: "",
    isSeller: true,
  },
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export const categories: Category[] = [
  { id: "c_fashion", name: "Fashion", emoji: "👗" },
  { id: "c_beauty", name: "Beauty", emoji: "💄" },
  { id: "c_tech", name: "Tech", emoji: "🎧" },
  { id: "c_home", name: "Home", emoji: "🛋️" },
  { id: "c_fitness", name: "Fitness", emoji: "🏋️" },
  { id: "c_kicks", name: "Footwear", emoji: "👟" },
  { id: "c_kitchen", name: "Kitchen", emoji: "🍳" },
  { id: "c_jewelry", name: "Jewelry", emoji: "💍" },
];

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------
export const stories: Story[] = [
  { id: "s_own", user: users.you, isOwn: true },
  { id: "s_aria", user: users.aria },
  { id: "s_mia", user: users.mia },
  { id: "s_nova", user: users.nova },
  { id: "s_zane", user: users.zane, seen: true },
  { id: "s_leo", user: users.leo },
  { id: "s_kabir", user: users.kabir, seen: true },
  { id: "s_isha", user: users.isha },
];

// ---------------------------------------------------------------------------
// Banners (ads hero)
// ---------------------------------------------------------------------------
export const banners: Banner[] = [
  {
    id: "b_1",
    title: "Monsoon Edit",
    subtitle: "Up to 40% off curated fashion",
    gradient: "linear-gradient(120deg,#0f0f12,#3a2d6b 60%,#7c3aed)",
    cta: "Shop now",
  },
  {
    id: "b_2",
    title: "Creator Drops",
    subtitle: "Limited reels-only launches",
    gradient: "linear-gradient(120deg,#dd2a7b,#8134af 60%,#515bd4)",
    cta: "Explore",
  },
  {
    id: "b_3",
    title: "Home Refresh",
    subtitle: "New arrivals from Nova Living",
    gradient: "linear-gradient(120deg,#0e9f6e,#0f766e 60%,#0f172a)",
    cta: "Discover",
  },
];

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export const products: Product[] = [
  {
    id: "p_jacket",
    title: "Oversized Linen Blazer",
    pricePaise: 389900,
    mrpPaise: 549900,
    imageUrl: "",
    rating: 4.7,
    ratingCount: 1280,
    seller: users.aria,
    categoryId: "c_fashion",
  },
  {
    id: "p_serum",
    title: "Glow Vitamin-C Serum 30ml",
    pricePaise: 89900,
    mrpPaise: 119900,
    imageUrl: "",
    rating: 4.6,
    ratingCount: 5420,
    seller: users.mia,
    categoryId: "c_beauty",
  },
  {
    id: "p_buds",
    title: "Nova ANC Wireless Buds",
    pricePaise: 249900,
    mrpPaise: 399900,
    imageUrl: "",
    rating: 4.5,
    ratingCount: 8910,
    seller: users.leo,
    categoryId: "c_tech",
  },
  {
    id: "p_lamp",
    title: "Arc Floor Lamp — Matte Black",
    pricePaise: 549900,
    mrpPaise: 699900,
    imageUrl: "",
    rating: 4.8,
    ratingCount: 642,
    seller: users.nova,
    categoryId: "c_home",
  },
  {
    id: "p_kicks",
    title: "Cloudrunner Sneakers",
    pricePaise: 459900,
    mrpPaise: 599900,
    imageUrl: "",
    rating: 4.4,
    ratingCount: 3110,
    seller: users.zane,
    categoryId: "c_kicks",
  },
  {
    id: "p_mat",
    title: "Pro Grip Yoga Mat 6mm",
    pricePaise: 159900,
    mrpPaise: 219900,
    imageUrl: "",
    rating: 4.7,
    ratingCount: 2240,
    seller: users.kabir,
    categoryId: "c_fitness",
  },
  {
    id: "p_vase",
    title: "Handglazed Ceramic Vase",
    pricePaise: 129900,
    imageUrl: "",
    rating: 4.9,
    ratingCount: 318,
    seller: users.isha,
    categoryId: "c_home",
  },
  {
    id: "p_watch",
    title: "Minimalist Steel Watch",
    pricePaise: 729900,
    mrpPaise: 999900,
    imageUrl: "",
    rating: 4.6,
    ratingCount: 1560,
    seller: users.leo,
    categoryId: "c_jewelry",
  },
];

const productById = Object.fromEntries(products.map((p) => [p.id, p]));

// ---------------------------------------------------------------------------
// Social buys — "people you follow bought this"
// ---------------------------------------------------------------------------
export const socialBuys: SocialBuy[] = [
  { id: "sb_1", buyer: users.aria, product: productById.p_serum, boughtAt: "2h ago" },
  { id: "sb_2", buyer: users.kabir, product: productById.p_buds, boughtAt: "5h ago" },
  { id: "sb_3", buyer: users.mia, product: productById.p_kicks, boughtAt: "Yesterday" },
];

// ---------------------------------------------------------------------------
// Posts (Instagram-style)
// ---------------------------------------------------------------------------
export const posts: Post[] = [
  {
    id: "post_1",
    author: users.aria,
    imageUrl: "",
    caption:
      "Linen season is officially open ☀️ This blazer goes with literally everything. Tagged it below — you get 5% back too!",
    likes: 12840,
    comments: 312,
    taggedProduct: productById.p_jacket,
    createdAt: "3h",
  },
  {
    id: "post_2",
    author: users.zane,
    imageUrl: "",
    caption: "Step game, sorted. 1 week in and zero regrets 👟",
    likes: 8021,
    comments: 188,
    liked: true,
    taggedProduct: productById.p_kicks,
    createdAt: "7h",
  },
  {
    id: "post_3",
    author: users.mia,
    imageUrl: "",
    caption: "My 3-step glow routine. The serum is the hero — swipe to shop ✨",
    likes: 23110,
    comments: 540,
    taggedProduct: productById.p_serum,
    createdAt: "1d",
  },
];

// ---------------------------------------------------------------------------
// Reels (shoppable, interest-ranked)
// ---------------------------------------------------------------------------
export const reels: Reel[] = [
  {
    id: "r_buds",
    author: users.leo,
    posterUrl: "",
    caption: "ANC so good you'll forget the world exists 🎧 #tech",
    product: productById.p_buds,
    likes: 45210,
    comments: 1203,
    shares: 880,
    reviewCount: 8910,
  },
  {
    id: "r_lamp",
    author: users.nova,
    posterUrl: "",
    caption: "This arc lamp changed my whole living room corner 🛋️",
    product: productById.p_lamp,
    likes: 18900,
    comments: 410,
    shares: 320,
    reviewCount: 642,
    liked: true,
  },
  {
    id: "r_kicks",
    author: users.zane,
    posterUrl: "",
    caption: "Run, walk, flex — these do it all 👟 #footwear",
    product: productById.p_kicks,
    likes: 67400,
    comments: 2210,
    shares: 1540,
    reviewCount: 3110,
  },
  {
    id: "r_mat",
    author: users.kabir,
    posterUrl: "",
    caption: "6mm of pure grip. Your knees will thank you 🧘",
    product: productById.p_mat,
    likes: 12030,
    comments: 305,
    shares: 210,
    reviewCount: 2240,
  },
];

export { productById };
