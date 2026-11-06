import { Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.describe('stat tiles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/stat-tiles');
    await page.locator('main h1').first().waitFor();
  });

  test('keeps columns at least 210px wide unless compact', async ({ page }) => {
    const tiles = example(page, 'Basic').getByRole('listitem');
    await expect(tiles).toHaveCount(4);
    for (const box of await Promise.all((await tiles.all()).map((tile) => tile.boundingBox()))) {
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(210);
    }
    const compact = example(page, 'Compact').getByRole('list', { name: 'Queue' });
    const first = await compact.getByRole('listitem').first().boundingBox();
    expect(first?.width ?? 0).toBeLessThan(210);
    expect(first?.width ?? 0).toBeGreaterThanOrEqual(126);
    const fifth = await compact.getByRole('listitem').nth(4).boundingBox();
    expect(Math.abs((fifth?.y ?? 0) - (first?.y ?? 0))).toBeLessThan(1);
  });

  test('a link tile shows a 2px ring on keyboard focus and opens its page', async ({ page }) => {
    const frame = example(page, 'Links');
    const link = frame.getByRole('link', { name: /Table/ });
    await link.focus();
    const tile = frame.getByRole('listitem').first();
    await expect
      .poll(() => tile.evaluate((element) => getComputedStyle(element).boxShadow))
      .toMatch(/ 0px 0px 0px 2px$/);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/components\/table$/);
  });

  test('the share bar follows the value', async ({ page }) => {
    const frame = example(page, 'Share');
    const meter = frame.getByRole('meter', { name: 'Images' });
    await expect(meter).toHaveAttribute('aria-valuenow', '36');
    const before = (await meter.locator('.tx-stat-tile__bar-fill').boundingBox())?.width ?? 0;
    await frame.getByRole('button', { name: 'Upload 5 GB of images' }).click();
    await expect(meter).toHaveAttribute('aria-valuenow', '46');
    await expect
      .poll(async () => (await meter.locator('.tx-stat-tile__bar-fill').boundingBox())?.width ?? 0)
      .toBeGreaterThan(before);
    await expect(frame.getByRole('meter', { name: 'Free' })).toHaveAttribute('aria-valuenow', '30');
  });

  test('a fit value stays on one line and a text value is cut with its full title', async ({
    page,
  }) => {
    const frame = example(page, 'Value modes');
    const fit = frame.locator('.tx-stat-tile--fit .tx-stat-tile__value');
    const size = await fit.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    expect(size).toBeGreaterThanOrEqual(14);
    expect(size).toBeLessThanOrEqual(24.5);
    const fitBox = await fit.boundingBox();
    expect(fitBox?.height ?? 0).toBeLessThan(size * 1.6);
    const text = frame.locator('.tx-stat-tile__value--text');
    await expect(text).toHaveAttribute('title', '/pricing/enterprise-plans-and-volume-discounts');
    expect(await text.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  });
});
