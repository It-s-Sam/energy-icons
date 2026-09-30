// Adapted from Toolcraft's hero renderer (MIT, Copyright (c) 2026 Pixel Point). See THIRD_PARTY_NOTICES.md.
/**
 * Decoded hero icons keyed by URL, plus single-color rasters cached per size and
 * color so the frames pass never re-tints on a steady frame. Ported from Toolcraft.
 */
const decodedIcons = new Map<string, HTMLImageElement>();
const pendingIcons = new Map<string, Promise<HTMLImageElement>>();
const tintedIcons = new Map<string, HTMLCanvasElement>();
const MAX_TINTED_ICONS = 96;

export function decodeHeroIcon(url: string): Promise<HTMLImageElement> {
  const decoded = decodedIcons.get(url);
  if (decoded) return Promise.resolve(decoded);
  const pending = pendingIcons.get(url);
  if (pending) return pending;
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  const next = image
    .decode()
    .then(() => {
      decodedIcons.set(url, image);
      return image;
    })
    .finally(() => pendingIcons.delete(url));
  pendingIcons.set(url, next);
  return next;
}

function fitWithin(width: number, height: number, box: number): [number, number] {
  const w = width > 0 ? width : box;
  const h = height > 0 ? height : box;
  const scale = box / Math.max(w, h);
  return [Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale))];
}

/** Single-color raster of the icon's alpha, so any SVG reads as one ink color. */
export function getTintedHeroIcon(url: string, color: string, boxPixels: number): HTMLCanvasElement | null {
  const image = decodedIcons.get(url);
  if (!image) return null;
  const box = Math.max(1, Math.round(boxPixels));
  const key = `${url}|${color}|${box}`;
  const cached = tintedIcons.get(key);
  if (cached) return cached;

  const [width, height] = fitWithin(image.naturalWidth, image.naturalHeight, box);
  // A plain canvas rather than OffscreenCanvas keeps older Safari working.
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(image, 0, 0, width, height);
  context.globalCompositeOperation = "source-in";
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);

  if (tintedIcons.size >= MAX_TINTED_ICONS) {
    const oldest = tintedIcons.keys().next().value;
    if (oldest !== undefined) tintedIcons.delete(oldest);
  }
  tintedIcons.set(key, canvas);
  return canvas;
}
