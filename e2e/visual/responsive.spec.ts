import { expect, test } from '@playwright/test';
import { layoutViewport } from './helpers';
import { PAGES } from './pages';

test.use({ viewport: { width: 360, height: 780 } });

for (const path of PAGES) {
  test(`${path} — phone width: no horizontal page overflow`, async ({ page }) => {
    await page.goto(path);
    await page.locator('main h1').first().waitFor();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    const { width } = await layoutViewport(page);
    const overflow = await page.evaluate((limit) => {
      const offenders = [...document.querySelectorAll('body *')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.right > limit + 1 && getComputedStyle(element).position !== 'fixed';
        })
        .slice(0, 3)
        .map((element) => `${element.tagName.toLowerCase()}.${[...element.classList].join('.')}`);
      return { scrollWidth: document.documentElement.scrollWidth, offenders };
    }, width);

    expect(overflow.scrollWidth, `page wider than the window: ${overflow.offenders.join(', ')}`).toBeLessThanOrEqual(width);
  });
}

test('the header collapses to the menu button at phone width', async ({ page }) => {
  await page.goto('/components/editor');
  await page.locator('main h1').first().waitFor();

  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeVisible();
  await expect(page.locator('.header__nav')).toBeHidden();

  const { width } = await layoutViewport(page);
  for (const selector of ['.header', '.tabs-bar']) {
    const box = await page.locator(selector).boundingBox();
    expect(box?.x, `${selector} left edge`).toBe(0);
    expect(box?.width, `${selector} width`).toBe(width);
  }
});
