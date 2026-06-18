// Client-only upload helper: ask the server for a presigned URL, then PUT the
// blob straight to R2. Returns the public URL to store on the record.

export type UploadKind = "reel" | "poster" | "post" | "product" | "kyc" | "avatar";

export interface UploadResult {
  publicUrl: string;
  key: string;
}

export async function uploadToR2(
  kind: UploadKind,
  blob: Blob,
  contentType: string,
): Promise<UploadResult> {
  const presignRes = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, contentType, size: blob.size }),
  });
  const presign = await presignRes.json();
  if (!presignRes.ok || !presign.ok) {
    throw new Error(presign.error ?? "Could not start upload.");
  }

  const putRes = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });
  if (!putRes.ok) throw new Error("Upload failed.");

  return { publicUrl: presign.publicUrl, key: presign.key };
}
