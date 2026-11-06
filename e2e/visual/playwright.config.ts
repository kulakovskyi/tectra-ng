import { defineConfig } from '@playwright/test';

const port = Number(process.env['TX_E2E_PORT'] ?? 4310);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL,
    channel: process.env['CI'] ? undefined : 'chrome',
    launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] },
    viewport: { width: 1440, height: 900 },
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `node tools/serve-docs.mjs dist/apps/docs/browser ${port}`,
    cwd: '../..',
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
  },
});
