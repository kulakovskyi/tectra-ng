import { Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.describe('virtual scroller', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/virtual-scroller');
    await page.locator('main h1').first().waitFor();
  });

  test('keeps a small window of items while scrolling with the keyboard', async ({ page }) => {
    const list = example(page, 'Basic').getByRole('region', { name: 'Items' });
    await list.focus();
    await expect(list.getByText('Item #1', { exact: true })).toBeVisible();
    const before = await list.locator('.tx-virtual-scroller__item').count();
    expect(before).toBeLessThan(20);
    await page.keyboard.press('End');
    await expect(list.getByText('Item #10000', { exact: true })).toBeVisible();
    expect(await list.locator('.tx-virtual-scroller__item').count()).toBeLessThan(20);
    const box = await list.boundingBox();
    const last = await list.getByText('Item #10000', { exact: true }).boundingBox();
    expect((last?.y ?? 0) + (last?.height ?? 0)).toBeLessThanOrEqual((box?.y ?? 0) + (box?.height ?? 0) + 1);
  });

  test('jumps to an item from outside', async ({ page }) => {
    const frame = example(page, 'Scroll to');
    await frame.getByRole('button', { name: 'Scroll to', exact: true }).click();
    await expect(frame.getByText('Item #5000', { exact: true })).toBeVisible();
    await expect(frame.getByText(/Visible: 4999/)).toBeVisible();
  });

  test('loads missing items lazily', async ({ page }) => {
    const list = example(page, 'Lazy').getByRole('region', { name: 'Orders from the server' });
    await expect(list.getByText('Order #10000', { exact: true })).toBeVisible();
    await list.evaluate((element) => element.scrollTo({ top: 4000 }));
    await expect(list.getByText('Order #10100', { exact: true })).toBeVisible();
  });
});

test.describe('data view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/data-view');
    await page.locator('main h1').first().waitFor();
  });

  test('switches between grid and list with the layout buttons', async ({ page }) => {
    const frame = example(page, 'Layout');
    const list = frame.getByRole('button', { name: 'List' });
    const grid = frame.getByRole('button', { name: 'Grid' });
    await expect(grid).toHaveAttribute('aria-pressed', 'true');
    await expect(frame.locator('.cards')).toBeVisible();
    await list.focus();
    await page.keyboard.press('Enter');
    await expect(list).toHaveAttribute('aria-pressed', 'true');
    await expect(frame.locator('.list')).toBeVisible();
    await expect(frame.locator('.cards')).toHaveCount(0);
  });

  test('sorts from the header select and the other examples keep working', async ({ page }) => {
    const sort = example(page, 'Sort');
    await expect(sort.getByRole('combobox', { name: 'Sort by' })).toHaveText(/Price: low to high/);
    await sort.getByRole('combobox', { name: 'Sort by' }).click();
    await page.getByRole('option', { name: 'Name' }).click();
    await expect(sort.locator('li strong').first()).toHaveText('Bookcase');
    const filter = example(page, 'Filter');
    await filter.getByRole('searchbox', { name: 'Search products' }).fill('lamp');
    await expect(filter.locator('li')).toHaveCount(2);
  });

  test('pages server data with a loading overlay', async ({ page }) => {
    const frame = example(page, 'Server');
    await expect(frame.getByText('Oak desk')).toBeVisible();
    await frame.getByRole('button', { name: 'Next page' }).click();
    await expect(frame.locator('.tx-data-view__loading')).toBeVisible();
    await expect(frame.getByText('Wall shelf')).toBeVisible();
    await expect(frame.locator('.tx-data-view__loading')).toHaveCount(0);
  });
});
