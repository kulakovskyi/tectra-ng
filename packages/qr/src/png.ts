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

export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

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

export function qrToPng(text: string, options: TxQrPngOptions = {}): Promise<string> {
  return svgToPng(qrToSvg(text, options), options.pixelSize ?? 1024);
}
