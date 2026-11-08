import { ConsoleMessage, Page } from '@playwright/test';

const INTENTIONALLY_MISSING = /\/missing-[^/]*$/;

const isIntentionallyMissing = (message: ConsoleMessage) => INTENTIONALLY_MISSING.test(message.location().url);

export async function trackPage(page: Page): Promise<() => Promise<{ errors: string[]; layoutShift: number }>> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => message.type() === 'error' && !isIntentionallyMissing(message) && errors.push(message.text()));
  await page.addInitScript(() => {
    const target = window as unknown as { __layoutShift: number };
    target.__layoutShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!entry.hadRecentInput) {
          target.__layoutShift += entry.value;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  return async () => ({ errors, layoutShift: await page.evaluate(() => (window as unknown as { __layoutShift: number }).__layoutShift) });
}

export async function layoutViewport(page: Page): Promise<{ width: number; height: number }> {
  return page.evaluate(() => ({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }));
}

export async function setDarkMode(page: Page): Promise<void> {
  await page.evaluate(() => document.documentElement.setAttribute('data-tx-theme', 'dark'));
}
