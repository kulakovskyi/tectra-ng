import { qrToSvg } from './svg';
import { TxQrPngOptions } from './types';

async function toDataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Replaces image links inside an SVG with data URLs so the SVG can be drawn to a canvas; images that
 * cannot be fetched stay as they are. Browser only.
 */
export async function inlineSvgImages(svg: string): Promise<string> {
  const urls = Array.from(new Set(Array.from(svg.matchAll(/href="([^"]+)"/g), (match) => match[1]))).filter((url) => !url.startsWith('data:') && !url.startsWith('#'));
  let result = svg;
  for (const url of urls) {
    try {
      const dataUrl = await toDataUrl(url.replace(/&amp;/g, '&'));
      result = result.split(`href="${url}"`).join(`href="${dataUrl}"`);
    } catch {
      continue;
    }
  }
  return result;
}

/** Wraps an SVG string into a `data:image/svg+xml` URL. */
export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Draws an SVG onto a square canvas and returns it as a PNG data URL (default 1024 px). Browser only. */
export async function svgToPng(svg: string, pixelSize = 1024): Promise<string> {
  const image = new Image();
  image.src = svgDataUrl(await inlineSvgImages(svg));
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = pixelSize;
  canvas.height = pixelSize;
  canvas.getContext('2d')?.drawImage(image, 0, 0, pixelSize, pixelSize);
  return canvas.toDataURL('image/png');
}

/** Renders text as a QR code PNG data URL; `pixelSize` sets the side in px (default 1024). Browser only. */
export function qrToPng(text: string, options: TxQrPngOptions = {}): Promise<string> {
  return svgToPng(qrToSvg(text, options), options.pixelSize ?? 1024);
}
