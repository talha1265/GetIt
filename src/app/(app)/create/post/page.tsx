"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BadgePercent, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { compressImage } from "@/lib/media/compress";
import { usePosts } from "@/lib/store/posts";
import { products } from "@/lib/mock/data";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function CreatePostPage() {
  const router = useRouter();
  const { status } = useSession();
  const addPost = usePosts((s) => s.addPost);
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [productId, setProductId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [posting, setPosting] = useState(false);

  async function onPick(file: File) {
    setProcessing(true);
    try {
      const { blob } = await compressImage(file, { maxDim: 1280, quality: 0.8, mime: "image/jpeg" });
      const url = await blobToDataUrl(blob);
      setDataUrl(url);
      setPreview(url);
    } finally {
      setProcessing(false);
    }
  }

  function publish() {
    if (!dataUrl) return;
    setPosting(true);
    const id = addPost({
      imageUrl: dataUrl,
      caption: caption.trim(),
      taggedProductId: productId || undefined,
    });
    void id;
    router.push("/");
    router.refresh();
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <ImagePlus className="h-10 w-10 text-muted" strokeWidth={1.5} />
        <p className="text-sm text-muted">Sign in to share a post.</p>
        <Link href="/login">
          <Button variant="primary" size="lg">Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-4 py-4">
      <h1 className="text-xl font-bold">New post</h1>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-cashback">
        <BadgePercent className="h-3.5 w-3.5" />
        Tag a product to earn 5% cashback when someone buys from your post.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />

      <div className="mt-4 space-y-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="preview"
            onClick={() => inputRef.current?.click()}
            className="aspect-square w-full rounded-2xl object-cover"
          />
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border-strong bg-surface-muted text-muted"
          >
            {processing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-10 w-10" strokeWidth={1.5} />
                <span className="text-sm font-semibold">Select a photo</span>
              </>
            )}
          </button>
        )}

        <textarea
          placeholder="Write a caption…"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-2xl border border-border bg-surface p-3 text-sm outline-none focus:border-foreground"
        />

        <div>
          <label className="mb-1 block text-sm font-semibold">Tag a product (optional)</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface p-3 text-sm outline-none"
          >
            <option value="">No product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Button variant="primary" size="lg" fullWidth disabled={!dataUrl || posting} onClick={publish}>
          {posting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Share post"}
        </Button>
      </div>
    </div>
  );
}
