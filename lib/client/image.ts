// Shrinks a photo in the browser before upload: max 1600px on the long edge, JPEG at 0.85.
// Keeps tokens, latency and request size down, and strips EXIF (incl. GPS) by re-encoding.

export const MAX_EDGE = 1600;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;

export class ImageError extends Error {}

export interface PreparedImage {
  mimeType: "image/jpeg";
  data: string; // base64, no data: prefix
  previewUrl: string;
  bytes: number;
}

export async function prepareImage(file: Blob): Promise<PreparedImage> {
  if (!file.type.startsWith("image/")) throw new ImageError("That file isn't an image. Use a photo or a screenshot.");
  if (file.size > MAX_ORIGINAL_BYTES) throw new ImageError("That photo is too large (over 25 MB). Try a screenshot instead.");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageError("We couldn't open that image. If it's a HEIC photo, take a screenshot of it and upload that.");
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageError("Your browser couldn't process the image.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob) throw new ImageError("Your browser couldn't process the image.");
  if (blob.size > MAX_UPLOAD_BYTES) throw new ImageError("That image is still over 8 MB after shrinking. Try a screenshot.");

  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new ImageError("Couldn't read the image."));
    reader.readAsDataURL(blob);
  });
  return { mimeType: "image/jpeg", data, previewUrl: URL.createObjectURL(blob), bytes: blob.size };
}
