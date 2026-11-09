import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

async function scrollInto(page: Page, selector: string, share: number): Promise<void> {
  await page.evaluate(
    ({ selector, share }) => {
      const element = document.querySelector(selector) as HTMLElement;
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + (element.offsetHeight - document.documentElement.clientHeight) * share);
    },
    { selector, share },
  );
}

const progress = (page: Page, selector: string) => page.locator(selector).evaluate((element) => Number((element as HTMLElement).style.getPropertyValue('--p')));

test.describe('landing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('h1').waitFor();
  });

  test('the laptop straightens as the page scrolls', async ({ page }) => {
    const before = await progress(page, '.laptop');
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect.poll(() => progress(page, '.laptop')).toBeGreaterThan(before);
  });

  test('the highlights move sideways while the page scrolls down', async ({ page }) => {
    const first = page.locator('.highlight').first();
    await scrollInto(page, '.highlights', 0);
    const start = (await first.boundingBox())?.x ?? 0;
    await scrollInto(page, '.highlights', 0.8);
    await expect(page.locator('.highlights__stage')).toBeInViewport();
    await expect.poll(async () => (await first.boundingBox())?.x ?? 0).toBeLessThan(start - 300);
  });

  test('the dark shot wipes over the light one', async ({ page }) => {
    await scrollInto(page, '.dark-mode', 0.95);
    await expect.poll(() => page.locator('.dark-mode__dark').evaluate((element) => getComputedStyle(element).clipPath)).toMatch(/^inset\(0px 0px 0px 0(px|%)\)$/);
  });

  test('the numbers count up to their values', async ({ page }) => {
    await page.locator('.stats').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 300));
    await expect(page.locator('.stat__value').nth(1)).toHaveText('334');
  });

  test('leads into the docs', async ({ page }) => {
    await page.getByRole('link', { name: 'Browse the docs' }).click();
    await expect(page).toHaveURL(/\/docs$/);
    await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeVisible();
  });
});
