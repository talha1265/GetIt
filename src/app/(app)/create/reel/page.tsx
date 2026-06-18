"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  Film,
  Loader2,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { Media } from "@/components/ui/Media";
import {
  compressVideo,
  generateVideoPoster,
  type CompressedVideo,
} from "@/lib/media/compress";
import { uploadToR2 } from "@/lib/media/upload";
import { products } from "@/lib/mock/data";

type Phase = "idle" | "processing" | "ready" | "uploading" | "done" | "error";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function CreateReelPage() {
  const router = useRouter();
  const { status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [original, setOriginal] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [posterBlob, setPosterBlob] = useState<Blob | null>(null);
  const [video, setVideo] = useState<CompressedVideo | null>(null);
  const [caption, setCaption] = useState("");
  const [productId, setProductId] = useState(products[0].id);
  const [error, setError] = useState<string | null>(null);

  async function onPick(file: File) {
    setError(null);
    setOriginal(file);
    setPhase("processing");
    setProgress(0);
    try {
      try {
        const poster = await generateVideoPoster(file);
        setPosterBlob(poster.blob);
        setPosterUrl(URL.createObjectURL(poster.blob));
      } catch {
        /* poster optional */
      }
      const compressed = await compressVideo(file, setProgress);
      setVideo(compressed);
      setPhase("ready");
    } catch (e) {
      setError((e as Error).message ?? "Could not process video.");
      setPhase("error");
    }
  }

  async function publish() {
    if (!video) return;
    setPhase("uploading");
    setError(null);
    try {
      const { publicUrl: videoUrl } = await uploadToR2("reel", video.blob, video.contentType);
      let uploadedPoster: string | undefined;
      if (posterBlob) {
        uploadedPoster = (await uploadToR2("poster", posterBlob, "image/jpeg")).publicUrl;
      }
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, caption, videoUrl, posterUrl: uploadedPoster }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Could not publish.");
      setPhase("done");
      setTimeout(() => router.push("/reels"), 900);
    } catch (e) {
      setError((e as Error).message ?? "Upload failed.");
      setPhase("error");
    }
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <Film className="h-10 w-10 text-muted" strokeWidth={1.5} />
        <p className="text-sm text-muted">Sign in to post a reel.</p>
        <Link href="/login">
          <Button variant="primary" size="lg">Sign in</Button>
        </Link>
      </div>
    );
  }

  const savings =
    original && video?.compressed
      ? Math.max(0, Math.round((1 - video.blob.size / original.size) * 100))
      : 0;

  return (
    <div className="flex h-full flex-col px-4 py-4">
      <h1 className="text-xl font-bold">New reel</h1>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        Videos are compressed to 720p in your browser before upload.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />

      {phase === "idle" ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-6 flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border-strong bg-surface-muted text-muted"
        >
          <UploadCloud className="h-10 w-10" strokeWidth={1.5} />
          <span className="text-sm font-semibold">Select a video</span>
          <span className="text-xs">MP4 or WebM · up to ~80MB after compression</span>
        </button>
      ) : (
        <div className="mt-4 space-y-4">
          {/* preview */}
          <div className="relative mx-auto aspect-[9/16] w-44 overflow-hidden rounded-2xl bg-black">
            {posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={posterUrl} alt="poster" className="h-full w-full object-cover" />
            ) : (
              <Media seed={original?.name ?? "reel"} rounded="rounded-2xl" className="h-full w-full" />
            )}
            {(phase === "processing" || phase === "uploading") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-white">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs font-medium">
                  {phase === "processing"
                    ? `Compressing ${Math.round(progress * 100)}%`
                    : "Uploading…"}
                </span>
              </div>
            )}
            {phase === "done" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-white">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
            )}
          </div>

          {/* size summary */}
          {phase === "processing" && (
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          )}
          {original && video && phase !== "processing" && (
            <p className="text-center text-xs text-muted">
              {formatBytes(original.size)} → {formatBytes(video.blob.size)}
              {video.compressed ? (
                <span className="ml-1 font-semibold text-cashback">−{savings}%</span>
              ) : (
                <span className="ml-1 text-muted">(compression unavailable — original kept)</span>
              )}
            </p>
          )}

          {/* caption */}
          <textarea
            placeholder="Write a caption…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-2xl border border-border bg-surface p-3 text-sm outline-none focus:border-foreground"
          />

          {/* product tag */}
          <label className="block text-sm font-semibold">Tag a product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface p-3 text-sm outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {(() => {
            const p = products.find((x) => x.id === productId)!;
            return <Price pricePaise={p.pricePaise} mrpPaise={p.mrpPaise} />;
          })()}

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => {
                setPhase("idle");
                setVideo(null);
                setOriginal(null);
                setPosterUrl(null);
                setPosterBlob(null);
                setError(null);
              }}
            >
              Replace
            </Button>
            <Button
              variant="buy"
              size="lg"
              fullWidth
              disabled={phase !== "ready" || !caption.trim()}
              onClick={publish}
            >
              {phase === "uploading" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Upload & post"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
