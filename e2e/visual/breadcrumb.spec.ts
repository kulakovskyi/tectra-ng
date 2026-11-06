import { Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.describe('breadcrumb', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/breadcrumb');
    await page.locator('main h1').first().waitFor();
  });

  test('command items go back along the path, by mouse and by keyboard', async ({ page }) => {
    const frame = example(page, 'Commands');
    const trail = frame.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem');
    await frame.getByRole('button', { name: 'Open next folder' }).click();
    await expect(trail).toHaveText(['Documents', 'Reports', '2026', 'November']);
    await expect(frame.locator('[aria-current="page"]')).toHaveText('November');
    await frame.getByRole('button', { name: 'Reports' }).click();
    await expect(trail).toHaveText(['Documents', 'Reports']);
    await frame.getByRole('button', { name: 'Documents' }).focus();
    await page.keyboard.press('Enter');
    await expect(trail).toHaveText(['Documents']);
    await expect(frame.getByText('Last click: Documents')).toBeVisible();
  });

  test('items are centred on one line and router links navigate', async ({ page }) => {
    const frame = example(page, 'Basic');
    const items = frame.getByRole('listitem');
    await expect(items).toHaveCount(4);
    const middle = async (index: number) => {
      const box = await items.nth(index).boundingBox();
      return (box?.y ?? 0) + (box?.height ?? 0) / 2;
    };
    const first = await middle(0);
    for (const index of [1, 2, 3]) {
      expect(Math.abs((await middle(index)) - first)).toBeLessThan(1);
    }
    await frame.getByRole('link', { name: 'Theming' }).click();
    await expect(page).toHaveURL(/\/theming$/);
  });
});
