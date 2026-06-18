import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET;
const PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL;

/** True when R2 is fully configured. */
export const hasR2 = Boolean(
  ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY && BUCKET && PUBLIC_BASE_URL,
);

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ACCESS_KEY_ID!,
        secretAccessKey: SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

const EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type UploadKind = "reel" | "poster" | "post" | "product" | "kyc" | "avatar";

/** Build a namespaced object key, e.g. reels/<userId>/<uuid>.mp4 */
export function buildKey(kind: UploadKind, userId: string, contentType: string): string {
  const ext = EXT[contentType] ?? "bin";
  const folder =
    kind === "reel"
      ? "reels"
      : kind === "poster"
        ? "posters"
        : `${kind}s`;
  return `${folder}/${userId}/${randomUUID()}.${ext}`;
}

export function publicUrl(key: string): string {
  return `${PUBLIC_BASE_URL!.replace(/\/$/, "")}/${key}`;
}

/** Presigned PUT URL (valid 10 min) plus the eventual public GET URL. */
export async function presignUpload(
  key: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET!,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 600 });
  return { uploadUrl, publicUrl: publicUrl(key) };
}
