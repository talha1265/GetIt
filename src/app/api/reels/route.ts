import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma, hasDatabase } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  productId: z.string().min(1),
  caption: z.string().min(1).max(2200),
  videoUrl: z.string().url(),
  posterUrl: z.string().url().optional(),
  durationSec: z.number().int().positive().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Sign in to post." }, { status: 401 });
  }

  // Reels are seller-only content.
  const sessionRole = session?.user?.role;
  if (sessionRole !== "SELLER" && sessionRole !== "ADMIN") {
    return NextResponse.json(
      { ok: false, error: "Only sellers can upload reels." },
      { status: 403 },
    );
  }
  if (!hasDatabase) {
    return NextResponse.json(
      { ok: false, error: "Posting is not available until a database is connected." },
      { status: 503 },
    );
  }

  // Authoritative role check against the DB.
  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!account || (account.role !== "SELLER" && account.role !== "ADMIN")) {
    return NextResponse.json(
      { ok: false, error: "Only sellers can upload reels." },
      { status: 403 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid reel data." }, { status: 400 });
  }

  try {
    const reel = await prisma.reel.create({
      data: {
        authorId: userId,
        productId: parsed.data.productId,
        caption: parsed.data.caption,
        videoUrl: parsed.data.videoUrl,
        posterUrl: parsed.data.posterUrl ?? null,
        durationSec: parsed.data.durationSec ?? null,
      },
    });
    return NextResponse.json({ ok: true, id: reel.id });
  } catch (err) {
    console.error("create reel failed", err);
    return NextResponse.json({ ok: false, error: "Could not publish reel." }, { status: 500 });
  }
}
