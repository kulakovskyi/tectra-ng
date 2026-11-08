import { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { layoutViewport } from './helpers';

const example = (page: Page, id: string) => page.locator(`image-${id}-example`);

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('image', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/image');
    await page.locator('main h1').first().waitFor();
  });

  test('the preview covers the window with the toolbar in the top right corner', async ({ page }) => {
    const root = example(page, 'preview');
    await root.scrollIntoViewIfNeeded();
    await root.getByRole('button', { name: 'Zoom image' }).click();
    const dialog = page.getByRole('dialog', { name: 'Dawn over the ridge' });
    await expect(dialog).toBeVisible();
    const view = await layoutViewport(page);
    const layer = await box(dialog);
    expect(Math.round(layer.width)).toBe(view.width);
    expect(Math.round(layer.height)).toBe(view.height);
    const toolbar = await box(dialog.getByRole('toolbar'));
    expect(view.width - (toolbar.x + toolbar.width)).toBeCloseTo(14, 0);
    expect(toolbar.y).toBeCloseTo(14, 0);
    const image = await box(dialog.locator('.tx-image-preview__original'));
    expect(Math.abs(image.x + image.width / 2 - view.width / 2)).toBeLessThan(2);
    expect(image.y).toBeGreaterThanOrEqual(toolbar.y + toolbar.height);
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
  });

  test('rotates, zooms and drags the zoomed image', async ({ page }) => {
    const root = example(page, 'zoom');
    await root.scrollIntoViewIfNeeded();
    await root.getByRole('button', { name: 'Zoom image' }).click();
    const dialog = page.getByRole('dialog', { name: 'Night sky' });
    const image = dialog.locator('.tx-image-preview__original');
    const before = await box(image);
    await dialog.getByRole('button', { name: 'Zoom in' }).click();
    await dialog.getByRole('button', { name: 'Zoom in' }).click();
    await expect.poll(async () => (await box(image)).width).toBeGreaterThan(before.width * 1.45);
    const zoomed = await box(image);
    await page.mouse.move(zoomed.x + zoomed.width / 2, zoomed.y + zoomed.height / 2);
    await page.mouse.down();
    await page.mouse.move(zoomed.x + zoomed.width / 2 + 60, zoomed.y + zoomed.height / 2 + 30, { steps: 6 });
    await page.mouse.up();
    await expect.poll(async () => Math.round((await box(image)).x - zoomed.x)).toBe(60);
    await page.keyboard.press('0');
    await dialog.getByRole('button', { name: 'Rotate right' }).click();
    await expect(image).toHaveAttribute('style', /rotate\(90deg\) scale\(1\)/);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(root.getByRole('button', { name: 'Zoom image' })).toBeFocused();
  });

  test('a click beside the image closes the preview, a click on it does not', async ({ page }) => {
    const root = example(page, 'preview');
    await root.scrollIntoViewIfNeeded();
    await root.getByRole('button', { name: 'Zoom image' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('.tx-image-preview__original').click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(20, 450);
    await expect(dialog).toHaveCount(0);
    await expect(root.locator('.status')).toHaveText('Preview closed');
  });
});

test.describe('image preview motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('only the backdrop and the toolbar fade, so the glass toolbar blurs the page from the first frame', async ({ page }) => {
    await page.goto('/components/image');
    await page.locator('main h1').first().waitFor();
    const root = example(page, 'preview');
    await root.scrollIntoViewIfNeeded();
    await root.getByRole('button', { name: 'Zoom image' }).click();
    const dialog = page.getByRole('dialog');
    const animated = await dialog.evaluate((element) => element.getAnimations().length);
    expect(animated).toBe(0);
    await expect(dialog.locator('.tx-image-preview__toolbar')).toHaveCSS('backdrop-filter', 'blur(8px)');
    await page.keyboard.press('Escape');
    await expect(dialog.locator('.tx-image-preview__backdrop')).toHaveCount(1);
    await expect(dialog).toHaveCount(0);
  });
});
