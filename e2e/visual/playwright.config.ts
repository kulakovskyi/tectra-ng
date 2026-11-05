import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4310',
    channel: process.env['CI'] ? undefined : 'chrome',
    viewport: { width: 1440, height: 900 },
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node tools/serve-docs.mjs dist/apps/docs/browser 4310',
    cwd: '../..',
    url: 'http://localhost:4310',
    reuseExistingServer: !process.env['CI'],
  },
});
