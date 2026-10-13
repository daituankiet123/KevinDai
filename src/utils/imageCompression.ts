// Client-side image compression using <canvas>. Resizes large images down to a
// max dimension and re-encodes as JPEG to keep localStorage/IndexedDB usage small.

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.8;
const MAX_BYTES = 8 * 1024 * 1024; // 8MB input guard

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

export async function compressImage(file: File, options: CompressOptions = {}): Promise<string> {
  const maxDimension = options.maxDimension ?? MAX_DIMENSION;
  const quality = options.quality ?? JPEG_QUALITY;

  if (file.size > MAX_BYTES) {
    throw new Error('IMAGE_TOO_LARGE');
  }

  const dataUrl = await readFileAsDataURL(file);

  // SVG or already-small images can be returned as-is (SVG cannot be rasterized
  // cleanly without losing vector quality; tiny images gain nothing from re-encode).
  if (file.type === 'image/svg+xml') {
    return dataUrl;
  }

  const img = await loadImage(dataUrl);
  const { width, height } = scaleToFit(img.width, img.height, maxDimension);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // Canvas unsupported — fall back to original
    return dataUrl;
  }

  ctx.drawImage(img, 0, 0, width, height);

  // PNG images with transparency keep PNG format; others become JPEG.
  const outType = hasTransparency(file.type) ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(outType, quality);
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('READ_FAILED'));
    };
    reader.onerror = () => reject(new Error('READ_FAILED'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'));
    img.src = src;
  });
}

function scaleToFit(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }
  const ratio = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function hasTransparency(type: string): boolean {
  return type === 'image/png' || type === 'image/webp' || type === 'image/gif';
}
