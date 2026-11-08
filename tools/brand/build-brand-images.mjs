import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = new URL('../../', import.meta.url).pathname;
const publicDir = join(root, 'apps/docs/public');
const mark = readFileSync(join(publicDir, 'favicon.svg'), 'utf8');

const icons = [
  { file: 'favicon.ico', size: 48 },
  { file: 'apple-touch-icon.png', size: 180, inset: 0.1, background: '#2560e4' },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-maskable-512.png', size: 512, inset: 0.1, background: '#2560e4' },
];

function iconPage({ size, inset = 0, background = 'transparent' }) {
  const pad = Math.round(size * inset);
  return `<html><body style="margin:0;width:${size}px;height:${size}px;background:${background};display:grid;place-items:center">
    <div style="width:${size - pad * 2}px;height:${size - pad * 2}px">${mark.replace('<svg ', '<svg width="100%" height="100%" ')}</div>
  </body></html>`;
}

function toIco(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
for (const icon of icons) {
  const page = await browser.newPage({ viewport: { width: icon.size, height: icon.size } });
  await page.setContent(iconPage(icon));
  const png = await page.screenshot({ omitBackground: !icon.background });
  writeFileSync(join(publicDir, icon.file), icon.file.endsWith('.ico') ? toIco(png, icon.size) : png);
  await page.close();
}

const preview = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await preview.goto(pathToFileURL(join(root, 'tools/brand/social-preview.html')).href);
await preview.evaluate(() => document.fonts.ready);
writeFileSync(join(publicDir, 'images/social-preview.png'), await preview.screenshot());
await browser.close();

console.log(`brand images: ${icons.map((icon) => icon.file).join(', ')}, images/social-preview.png`);
