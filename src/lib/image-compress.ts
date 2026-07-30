"use client";

const SKIP_THRESHOLD_BYTES = 1_500_000;
const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;

/**
 * Resizes and re-encodes an image client-side before upload.
 *
 * Vercel's serverless functions hard-reject request bodies over ~4.5MB with a plain-text
 * 413 response, well before the app's own upload route ever runs — a real camera/phone
 * photo (often 5-15MB) fails there every time. Shrinking to a sane web dimension and
 * re-encoding as JPEG here keeps uploads a few hundred KB to ~2MB regardless of the
 * source file, so that limit is never realistically hit.
 */
export async function compressImageFile(file: File): Promise<File> {
  if (file.size <= SKIP_THRESHOLD_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^./]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // If the browser can't decode/re-encode it for any reason, fall back to the
    // original file and let the server's own size check catch anything too large.
    return file;
  }
}
