// Resizes and re-encodes a photo in the browser before upload. Re-encoding through a canvas
// also strips EXIF metadata, including the GPS location phones embed in photos.
async function encode(bitmap, maxDim, quality) {
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  // JPEG rather than WebP: Safari can't encode WebP from a canvas.
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Couldn't process this photo");
  return { blob, width, height };
}

export async function preparePhoto(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`Couldn't read ${file.name}. If it's a HEIC photo, try uploading from your phone or exporting as JPEG.`);
  }
  try {
    const full = await encode(bitmap, 2000, 0.85);
    const thumb = await encode(bitmap, 800, 0.8);
    return { full: full.blob, thumb: thumb.blob, width: full.width, height: full.height };
  } finally {
    bitmap.close();
  }
}
