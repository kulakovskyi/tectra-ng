import { Page, expect, test } from '@playwright/test';

const example = (page: Page, id: string) => page.locator(`toolbar-${id}-example`);

test.describe('toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/toolbar');
    await page.locator('main h1').first().waitFor();
  });

  test('groups sit at the start, the centre and the end of the bar', async ({ page }) => {
    const root = example(page, 'center');
    const bar = await root.getByRole('toolbar').boundingBox();
    const start = await root.locator('.tx-toolbar__start').boundingBox();
    const center = await root.locator('.tx-toolbar__center').boundingBox();
    const end = await root.locator('.tx-toolbar__end').boundingBox();
    if (!bar || !start || !center || !end) {
      throw new Error('toolbar groups are not visible');
    }
    expect(start.x - bar.x).toBeCloseTo(9.75, 0);
    expect(bar.x + bar.width - (end.x + end.width)).toBeCloseTo(9.75, 0);
    expect(center.x).toBeGreaterThan(start.x + start.width);
    expect(end.x).toBeGreaterThan(center.x + center.width);
  });

  test('actions run from the toolbar', async ({ page }) => {
    const root = example(page, 'basic');
    await root.getByRole('button', { name: 'Upload' }).click();
    await expect(root.getByText('Last action: Upload')).toBeVisible();
    await root.getByRole('button', { name: 'Print' }).click();
    await expect(root.getByText('Last action: Print')).toBeVisible();
  });
});
