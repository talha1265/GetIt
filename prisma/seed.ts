import { PrismaClient } from "@prisma/client";
import { users, categories, products, posts, reels } from "../src/lib/mock/data";

const prisma = new PrismaClient();

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  console.log("Seeding getIt…");

  // Categories
  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name, slug: slugify(c.name), emoji: c.emoji },
      create: { id: c.id, name: c.name, slug: slugify(c.name), emoji: c.emoji },
    });
  }

  // Users (+ sellers)
  let phoneSeq = 10;
  for (const u of Object.values(users)) {
    const phone = `+9190000000${(phoneSeq++).toString().padStart(2, "0")}`;
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        username: u.username,
        displayName: u.displayName,
        verified: !!u.verified,
        role: u.isSeller ? "SELLER" : "USER",
      },
      create: {
        id: u.id,
        phone,
        username: u.username,
        displayName: u.displayName,
        verified: !!u.verified,
        role: u.isSeller ? "SELLER" : "USER",
      },
    });
    if (u.isSeller) {
      await prisma.seller.upsert({
        where: { userId: u.id },
        update: {},
        create: {
          userId: u.id,
          businessName: `${u.displayName} Pvt Ltd`,
          kycStatus: "APPROVED",
          approvedAt: new Date(),
        },
      });
    }
  }

  // Products
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        title: p.title,
        pricePaise: p.pricePaise,
        mrpPaise: p.mrpPaise ?? null,
        rating: p.rating,
        ratingCount: p.ratingCount,
      },
      create: {
        id: p.id,
        sellerId: p.seller.id,
        categoryId: p.categoryId,
        title: p.title,
        slug: slugify(`${p.title}-${p.id}`),
        pricePaise: p.pricePaise,
        mrpPaise: p.mrpPaise ?? null,
        imageUrls: [],
        stock: 100,
        rating: p.rating,
        ratingCount: p.ratingCount,
        active: true,
      },
    });
  }

  // Posts
  for (const post of posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: { caption: post.caption, likeCount: post.likes, commentCount: post.comments },
      create: {
        id: post.id,
        authorId: post.author.id,
        imageUrls: [],
        caption: post.caption,
        taggedProductId: post.taggedProduct?.id ?? null,
        likeCount: post.likes,
        commentCount: post.comments,
      },
    });
  }

  // Reels
  for (const reel of reels) {
    await prisma.reel.upsert({
      where: { id: reel.id },
      update: {
        caption: reel.caption,
        likeCount: reel.likes,
        commentCount: reel.comments,
        shareCount: reel.shares,
        reviewCount: reel.reviewCount,
      },
      create: {
        id: reel.id,
        authorId: reel.author.id,
        productId: reel.product.id,
        videoUrl: "",
        posterUrl: null,
        caption: reel.caption,
        likeCount: reel.likes,
        commentCount: reel.comments,
        shareCount: reel.shares,
        reviewCount: reel.reviewCount,
      },
    });
  }

  console.log("Seed complete ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
