import { Locator, Page, expect, test } from '@playwright/test';

const example = (page: Page, id: string) => page.locator(`carousel-${id}-example`);

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('carousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/carousel');
    await page.locator('main h1').first().waitFor();
  });

  test('shows three items that fill the viewport and steps by one', async ({ page }) => {
    const root = example(page, 'basic');
    await root.scrollIntoViewIfNeeded();
    const viewport = await box(root.locator('.tx-carousel__viewport'));
    const items = root.locator('.tx-carousel__item');
    const first = await box(items.nth(0));
    expect(first.width * 3).toBeCloseTo(viewport.width, 0);
    expect(first.x).toBeCloseTo(viewport.x, 0);
    await root.getByRole('button', { name: 'Next slide' }).click();
    await expect.poll(async () => Math.abs((await box(items.nth(1))).x - viewport.x)).toBeLessThan(1);
    await expect(items.nth(0)).toHaveAttribute('aria-hidden', 'true');
    await expect(root.locator('.status')).toContainText('Page 2');
  });

  test('a mouse drag pages and the drag does not click the card', async ({ page }) => {
    const root = example(page, 'basic');
    await root.scrollIntoViewIfNeeded();
    const viewport = await box(root.locator('.tx-carousel__viewport'));
    const y = viewport.y + 40;
    await page.mouse.move(viewport.x + viewport.width * 0.7, y);
    await page.mouse.down();
    await page.mouse.move(viewport.x + viewport.width * 0.2, y, { steps: 8 });
    await page.mouse.up();
    await expect(root.locator('.status')).toContainText('Page 2');
    await expect(root.locator('.status')).toContainText('last added: nothing');
  });

  test('indicators follow the keyboard', async ({ page }) => {
    const root = example(page, 'basic');
    const current = root.locator('.tx-carousel__indicator-button[aria-current="true"]');
    await current.focus();
    await page.keyboard.press('End');
    await expect(root.locator('.status')).toContainText('Page 5');
    await expect(root.getByRole('button', { name: 'Page 5' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(root.locator('.status')).toContainText('Page 1');
  });

  test('vertical carousel moves items up', async ({ page }) => {
    const root = example(page, 'vertical');
    await root.scrollIntoViewIfNeeded();
    const viewport = await box(root.locator('.tx-carousel__viewport'));
    expect(viewport.height).toBeCloseTo(380, 0);
    await root.getByRole('button', { name: 'Next slide' }).click();
    const second = root.locator('.tx-carousel__item').nth(1);
    await expect.poll(async () => Math.abs((await box(second)).y - viewport.y)).toBeLessThan(1);
  });
});
