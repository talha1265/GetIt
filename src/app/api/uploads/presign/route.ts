import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { hasR2, buildKey, presignUpload, type UploadKind } from "@/lib/storage/r2";

export const runtime = "nodejs";

const CONTENT_TYPES = [
  "video/mp4",
  "video/webm",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

// Max upload size per kind, in bytes (post-compression on the client).
const MAX_BYTES: Record<UploadKind, number> = {
  reel: 80 * 1024 * 1024,
  poster: 5 * 1024 * 1024,
  post: 10 * 1024 * 1024,
  product: 10 * 1024 * 1024,
  kyc: 10 * 1024 * 1024,
  avatar: 5 * 1024 * 1024,
};

const schema = z.object({
  kind: z.enum(["reel", "poster", "post", "product", "kyc", "avatar"]),
  contentType: z.enum(CONTENT_TYPES),
  size: z.number().int().positive(),
});

export async function POST(req: Request) {
  if (!hasR2) {
    return NextResponse.json(
      { ok: false, error: "Uploads are not configured (set R2_* env vars)." },
      { status: 503 },
    );
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Sign in to upload." }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid upload request." }, { status: 400 });
  }
  const { kind, contentType, size } = parsed.data;

  if (size > MAX_BYTES[kind]) {
    return NextResponse.json(
      { ok: false, error: `File too large (max ${Math.round(MAX_BYTES[kind] / 1024 / 1024)}MB).` },
      { status: 413 },
    );
  }

  try {
    const key = buildKey(kind, userId, contentType);
    const { uploadUrl, publicUrl } = await presignUpload(key, contentType);
    return NextResponse.json({ ok: true, uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("presign failed", err);
    return NextResponse.json({ ok: false, error: "Could not create upload URL." }, { status: 500 });
  }
}
