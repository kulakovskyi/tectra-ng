import { defineConfig } from '@playwright/test';
import { browserDir } from './workdir.mjs';

const port = Number(process.env['TX_NG_ADD_PORT'] ?? 4330);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: '.',
  tsconfig: './tsconfig.json',
  forbidOnly: !!process.env['CI'],
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL,
    channel: process.env['CI'] ? undefined : 'chrome',
    viewport: { width: 1280, height: 800 },
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `node tools/serve-docs.mjs "${browserDir}" ${port}`,
    cwd: '../..',
    url: baseURL,
    reuseExistingServer: false,
  },
});
