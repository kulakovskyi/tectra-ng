import { Locator, Page, expect, test } from '@playwright/test';
import { layoutViewport } from './helpers';

const example = (page: Page, id: string) => page.locator(`galleria-${id}-example`);

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('galleria', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/galleria');
    await page.locator('main h1').first().waitFor();
  });

  test('thumbnails select the image and keep the active one in view', async ({ page }) => {
    const root = example(page, 'basic');
    await root.scrollIntoViewIfNeeded();
    await root.getByRole('button', { name: 'Image 3' }).click();
    await expect(root.locator('.tx-galleria__item--active .tx-galleria__image')).toHaveAttribute('alt', 'Desert dunes');
    await page.keyboard.press('End');
    await expect(root.locator('.status')).toHaveText('Showing Arctic morning');
    const viewport = await box(root.locator('.tx-galleria__thumbnails-viewport'));
    const last = await box(root.getByRole('button', { name: 'Image 8' }));
    expect(last.x + last.width).toBeLessThanOrEqual(viewport.x + viewport.width + 1);
    expect(last.x).toBeGreaterThanOrEqual(viewport.x);
  });

  test('thumbnails on the side form a column beside the image', async ({ page }) => {
    const root = example(page, 'thumbnails');
    await root.scrollIntoViewIfNeeded();
    await root.getByRole('tab', { name: 'Left' }).click();
    const thumbnails = await box(root.locator('.tx-galleria__thumbnails'));
    const items = await box(root.locator('.tx-galleria__items'));
    expect(thumbnails.width).toBeCloseTo(128, 0);
    expect(thumbnails.x + thumbnails.width).toBeLessThanOrEqual(items.x + 1);
    await root.getByRole('tab', { name: 'Right' }).click();
    const right = await box(root.locator('.tx-galleria__thumbnails'));
    expect(right.x).toBeGreaterThanOrEqual((await box(root.locator('.tx-galleria__items'))).x + 100);
  });

  test('full screen opens at the picked photo over the whole window', async ({ page }) => {
    const root = example(page, 'full-screen');
    await root.scrollIntoViewIfNeeded();
    await root.getByRole('button', { name: 'Open Pine forest' }).click();
    const dialog = page.getByRole('dialog', { name: 'Gallery' });
    await expect(dialog).toBeVisible();
    const view = await layoutViewport(page);
    const layer = await box(dialog);
    expect(Math.round(layer.width)).toBe(view.width);
    expect(Math.round(layer.height)).toBe(view.height);
    await expect(dialog.locator('.tx-galleria__item--active .tx-galleria__image')).toHaveAttribute('alt', 'Pine forest');
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Next image' }).click();
    await expect(dialog.locator('.tx-galleria__item--active .tx-galleria__image')).toHaveAttribute('alt', 'Night sky');
    const frame = await box(dialog.locator('.tx-galleria__frame'));
    expect(Math.abs(frame.x + frame.width / 2 - view.width / 2)).toBeLessThan(2);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(root.getByRole('button', { name: 'Open Pine forest' })).toBeFocused();
  });

  test('item arrows appear on hover only', async ({ page }) => {
    const root = example(page, 'navigators');
    await root.scrollIntoViewIfNeeded();
    const next = root.getByRole('button', { name: 'Next image' });
    await expect(next).toHaveCSS('opacity', '0');
    await root.locator('.tx-galleria__items').hover();
    await expect(next).toHaveCSS('opacity', '1');
    await next.click();
    await expect(root.locator('.tx-galleria__item--active .tx-galleria__image')).toHaveAttribute('alt', 'Alpine lake');
  });
});

test.describe('galleria effects', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('the old and the new image move together without a blank frame', async ({ page }) => {
    await page.goto('/components/galleria');
    await page.locator('main h1').first().waitFor();
    const root = example(page, 'effects');
    await root.scrollIntoViewIfNeeded();
    await root.getByRole('tab', { name: 'Fade' }).click();
    const visible = () =>
      root.evaluate((element) =>
        Array.from(element.querySelectorAll<HTMLElement>('.tx-galleria__item'))
          .filter((item) => getComputedStyle(item).visibility !== 'hidden')
          .map((item) => Number(getComputedStyle(item).opacity)),
      );
    await root.getByRole('button', { name: 'Next image' }).click();
    await page.waitForTimeout(150);
    const during = await visible();
    expect(during).toHaveLength(2);
    expect(during[0] + during[1]).toBeGreaterThan(0.8);
    await expect.poll(async () => (await visible()).length).toBe(1);
    await expect(root.locator('.tx-galleria__item--active .tx-galleria__image')).toHaveAttribute('alt', 'Alpine lake');
  });
});
