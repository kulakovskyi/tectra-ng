import { Page, expect, test as base } from '@playwright/test';

export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => !!document.querySelector('docs-root') && !document.querySelector('[ngh]'), undefined, { polling: 50 });
}

export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    const reload = page.reload.bind(page);
    page.goto = async (...args: Parameters<Page['goto']>) => {
      const response = await goto(...args);
      await waitForHydration(page);
      return response;
    };
    page.reload = async (...args: Parameters<Page['reload']>) => {
      const response = await reload(...args);
      await waitForHydration(page);
      return response;
    };
    await use(page);
  },
});

export { expect };
