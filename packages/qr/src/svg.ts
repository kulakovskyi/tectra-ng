import { qrGradientLine, qrLayout } from './layout';
import { TxQrSvgOptions } from './types';

let nextId = 0;

const escape = (value: string | number) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Renders text as a standalone QR code SVG string with colours, gradient, shapes and an optional logo. */
export function qrToSvg(text: string, options: TxQrSvgOptions = {}): string {
  const layout = qrLayout(text, options);
  const { viewBox, paths, logoBox, matrix } = layout;
  const size = options.size ?? 200;
  const color = options.color ?? '#000000';
  const gradientId = `tx-qr-gradient-${(nextId += 1)}`;
  const parts: string[] = [];
  let dotFill = color;
  if (options.gradient) {
    const line = qrGradientLine(options.gradient, matrix.size);
    const stops = `<stop offset="0" stop-color="${escape(line.colors[0])}"/><stop offset="1" stop-color="${escape(line.colors[1])}"/>`;
    parts.push(
      line.radial
        ? `<defs><radialGradient id="${gradientId}" gradientUnits="userSpaceOnUse" cx="${line.center}" cy="${line.center}" r="${line.radius}">${stops}</radialGradient></defs>`
        : `<defs><linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}">${stops}</linearGradient></defs>`,
    );
    dotFill = `url(#${gradientId})`;
  }
  const eyeFill = options.eyeColor ?? dotFill;
  const ballFill = options.eyeBallColor ?? options.eyeColor ?? dotFill;
  parts.push(`<rect x="${viewBox.x}" y="${viewBox.y}" width="${viewBox.size}" height="${viewBox.size}" fill="${escape(options.background ?? '#ffffff')}"/>`);
  parts.push(`<path d="${paths.dots}" fill="${escape(dotFill)}"/>`);
  parts.push(`<path d="${paths.eyeFrames}" fill-rule="evenodd" fill="${escape(eyeFill)}"/>`);
  parts.push(`<path d="${paths.eyeBalls}" fill="${escape(ballFill)}"/>`);
  if (logoBox && options.logo) {
    parts.push(
      `<image href="${escape(options.logo)}" x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.size}" height="${logoBox.size}" preserveAspectRatio="xMidYMid meet"/>`,
    );
  }
  const title = options.title ? `<title>${escape(options.title)}</title>` : '';
  const crisp = (options.dotStyle ?? 'square') === 'square' ? ' shape-rendering="crispEdges"' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox.value}"${crisp}>${title}${parts.join('')}</svg>`;
}
