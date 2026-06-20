import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Promote a user (by phone, e.g. +919876543210) to SELLER so they can upload
// reels. Usage: npm run make:seller -- +919876543210
async function main() {
  const phone = process.argv[2];
  if (!phone) {
    console.error("Usage: npm run make:seller -- +919876543210");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { phone },
    data: { role: "SELLER" },
  });

  await prisma.seller.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      businessName: `${user.displayName}'s Shop`,
      kycStatus: "APPROVED",
      approvedAt: new Date(),
    },
  });

  console.log(`✓ ${phone} (${user.username}) is now a SELLER`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
