import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const root = new URL('../../', import.meta.url).pathname;
const out = join(root, 'apps/docs/public/images/landing');
const port = Number(process.env.TX_STUDIO_PORT ?? 4302);
const base = `http://localhost:${port}`;

const DESKTOP = { width: 1440, height: 900, scale: 1.5 };
const PHONE = { width: 390, height: 844, scale: 2 };
const SHOTS = [
  { scene: 'overview', size: DESKTOP, type: 'png' },
  { scene: 'board', size: DESKTOP, type: 'png' },
  { scene: 'editor', size: DESKTOP, type: 'png' },
  { scene: 'calendar', size: DESKTOP, type: 'png' },
  { scene: 'palette', size: DESKTOP, type: 'jpeg' },
  { scene: 'overview', name: 'phone', size: PHONE, type: 'png' },
];

async function waitForServer(server) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error('the docs dev server stopped');
    }
    try {
      if ((await fetch(base)).ok) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`the docs dev server did not answer on ${base}`);
}

mkdirSync(out, { recursive: true });
const server = spawn('npx', ['nx', 'serve', 'docs', `--port=${port}`], {
  cwd: root,
  env: { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true' },
  stdio: 'ignore',
  detached: true,
});

try {
  await waitForServer(server);
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const shot of SHOTS) {
    for (const mode of ['light', 'dark']) {
      const page = await browser.newPage({
        viewport: { width: shot.size.width, height: shot.size.height },
        deviceScaleFactor: shot.size.scale,
        reducedMotion: 'reduce',
      });
      await page.goto(`${base}/studio/${shot.scene}?mode=${mode}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      const file = join(out, `${shot.name ?? shot.scene}-${mode}.${shot.type === 'jpeg' ? 'jpg' : 'png'}`);
      await page.screenshot({ path: file, type: shot.type, ...(shot.type === 'jpeg' ? { quality: 86 } : {}) });
      console.log('saved', file.replace(root, ''));
      await page.close();
    }
  }
  await browser.close();
} finally {
  process.kill(-server.pid, 'SIGTERM');
}
