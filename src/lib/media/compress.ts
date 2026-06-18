// Client-only media helpers. These use browser APIs (canvas, video, WASM) and
// must only be called from client components.

export interface CompressedImage {
  blob: Blob;
  contentType: string;
  width: number;
  height: number;
}

/** Downscale + re-encode an image with a canvas. Defaults to WebP. */
export async function compressImage(
  file: File,
  { maxDim = 1440, quality = 0.82, mime = "image/webp" } = {},
): Promise<CompressedImage> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported");
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, mime, quality);
    return { blob, contentType: mime, width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Capture a poster frame from a video file as a JPEG blob. */
export async function generateVideoPoster(
  file: File,
  { seek = 0.1, maxDim = 1080, quality = 0.8 } = {},
): Promise<CompressedImage> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.src = url;
  try {
    await once(video, "loadedmetadata");
    video.currentTime = Math.min(seek, video.duration || seek);
    await once(video, "seeked");

    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    const width = Math.round(video.videoWidth * scale);
    const height = Math.round(video.videoHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported");
    ctx.drawImage(video, 0, 0, width, height);
    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    return { blob, contentType: "image/jpeg", width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export interface CompressedVideo {
  blob: Blob;
  contentType: string;
  /** False when compression was skipped/failed and the original was kept. */
  compressed: boolean;
}

// Single-thread ffmpeg core — works without cross-origin isolation.
const FFMPEG_BASE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

/**
 * Compress a reel to ~720p H.264 MP4 with ffmpeg.wasm. Loaded lazily so it
 * never bloats the initial bundle. On any failure (load error, unsupported
 * input) the original file is returned so the upload can still proceed.
 */
export async function compressVideo(
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<CompressedVideo> {
  try {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpeg();
    if (onProgress) {
      ffmpeg.on("progress", ({ progress }) => onProgress(Math.min(1, Math.max(0, progress))));
    }
    await ffmpeg.load({
      coreURL: await toBlobURL(`${FFMPEG_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${FFMPEG_BASE}/ffmpeg-core.wasm`, "application/wasm"),
    });

    const input = "input";
    await ffmpeg.writeFile(input, await fetchFile(file));
    await ffmpeg.exec([
      "-i", input,
      "-vf", "scale='min(720,iw)':-2",
      "-c:v", "libx264",
      "-crf", "28",
      "-preset", "veryfast",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      "output.mp4",
    ]);
    const data = await ffmpeg.readFile("output.mp4");
    const blob = new Blob([data as unknown as BlobPart], { type: "video/mp4" });
    onProgress?.(1);
    return { blob, contentType: "video/mp4", compressed: true };
  } catch (err) {
    console.warn("Video compression unavailable, uploading original.", err);
    return { blob: file, contentType: file.type || "video/mp4", compressed: false };
  }
}

// --- internals -----------------------------------------------------------
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function once(el: HTMLMediaElement, event: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ok = () => {
      cleanup();
      resolve();
    };
    const fail = () => {
      cleanup();
      reject(new Error(`video ${event} failed`));
    };
    const cleanup = () => {
      el.removeEventListener(event, ok);
      el.removeEventListener("error", fail);
    };
    el.addEventListener(event, ok, { once: true });
    el.addEventListener("error", fail, { once: true });
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      mime,
      quality,
    );
  });
}
