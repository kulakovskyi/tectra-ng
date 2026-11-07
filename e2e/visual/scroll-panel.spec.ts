import { Page, expect, test } from '@playwright/test';

const example = (page: Page, id: string) => page.locator(`scroll-panel-${id}-example`);

test.describe('scroll panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/scroll-panel');
    await page.locator('main h1').first().waitFor();
  });

  test('the bar shows on hover, follows the scroll and drags the content', async ({ page }) => {
    const root = example(page, 'basic');
    const content = root.locator('.tx-scroll-panel__content');
    const bar = root.getByRole('scrollbar', { includeHidden: true }).last();
    await expect(bar).toHaveCSS('opacity', '0');
    await content.hover();
    await expect(bar).toHaveCSS('opacity', '1');
    const start = await bar.boundingBox();
    await page.mouse.wheel(0, 120);
    await expect.poll(async () => (await bar.boundingBox())?.y ?? 0).toBeGreaterThan((start?.y ?? 0) + 5);
    await content.evaluate((element) => (element.scrollTop = 0));
    await expect.poll(async () => (await bar.boundingBox())?.y ?? 0).toBeCloseTo(start?.y ?? 0, 0);
    const rect = await bar.boundingBox();
    const x = (rect?.x ?? 0) + (rect?.width ?? 0) / 2;
    const y = (rect?.y ?? 0) + (rect?.height ?? 0) / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 40, { steps: 5 });
    await page.mouse.up();
    expect(await content.evaluate((element) => element.scrollTop)).toBeGreaterThan(40);
  });

  test('the content keeps the native scroll keys', async ({ page }) => {
    const content = example(page, 'basic').locator('.tx-scroll-panel__content');
    await content.focus();
    await page.keyboard.press('End');
    await expect.poll(() => content.evaluate((element) => element.scrollHeight - element.clientHeight - element.scrollTop)).toBeLessThan(2);
  });

  test('a max-height panel grows with its content and then scrolls', async ({ page }) => {
    const root = example(page, 'max-height');
    const panel = root.locator('tx-scroll-panel');
    const bar = root.locator('.tx-scroll-panel__bar--y');
    await expect(bar).toBeHidden();
    const add = root.getByRole('button', { name: 'Add task' });
    for (let index = 0; index < 8; index++) {
      await add.click();
    }
    await expect(bar).toBeAttached();
    await expect(bar).not.toHaveAttribute('hidden');
    expect((await panel.boundingBox())?.height ?? 0).toBeLessThanOrEqual(161);
  });

  test('both bars appear for wide and tall content', async ({ page }) => {
    const root = example(page, 'both-axes');
    await root.locator('.tx-scroll-panel__content').hover();
    await expect(root.locator('.tx-scroll-panel__bar--x')).toBeVisible();
    await expect(root.locator('.tx-scroll-panel__bar--y')).toBeVisible();
  });
});
