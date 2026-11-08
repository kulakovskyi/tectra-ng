import { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

const centerX = async (locator: Locator) => {
  const box = await locator.boundingBox();
  return (box?.x ?? 0) + (box?.width ?? 0) / 2;
};

const centerY = async (locator: Locator) => {
  const box = await locator.boundingBox();
  return (box?.y ?? 0) + (box?.height ?? 0) / 2;
};

test.describe('timeline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/timeline');
    await page.locator('main h1').first().waitFor();
  });

  test('stacks the markers on one vertical line joined by connectors', async ({ page }) => {
    const list = example(page, 'Opposite').getByRole('list', { name: 'Order history' });
    const markers = list.locator('.tx-timeline__marker');
    await expect(markers).toHaveCount(4);
    const x = await centerX(markers.first());
    for (const index of [1, 2, 3]) {
      expect(Math.abs((await centerX(markers.nth(index))) - x)).toBeLessThan(1);
    }
    const connectors = list.locator('.tx-timeline__connector');
    await expect(connectors).toHaveCount(3);
    const first = await connectors.first().boundingBox();
    const next = await markers.nth(1).boundingBox();
    expect(first?.width).toBe(2);
    expect(Math.abs((first?.y ?? 0) + (first?.height ?? 0) - (next?.y ?? 0))).toBeLessThan(1);
    const date = await list.getByText('15/10/2026 10:30').boundingBox();
    const status = await list.getByText('Ordered', { exact: true }).boundingBox();
    expect((date?.x ?? 0) + (date?.width ?? 0)).toBeLessThanOrEqual(x);
    expect(status?.x ?? 0).toBeGreaterThanOrEqual(x);
  });

  test('swaps sides on every other event when alternating', async ({ page }) => {
    const list = example(page, 'Alignment').getByRole('list', { name: 'Alternate' });
    const x = await centerX(list.locator('.tx-timeline__marker').first());
    const first = await list.getByText('Ordered', { exact: true }).boundingBox();
    const second = await list.getByText('Processing', { exact: true }).boundingBox();
    expect(first?.x ?? 0).toBeGreaterThan(x);
    expect((second?.x ?? 0) + (second?.width ?? 0)).toBeLessThan(x);
  });

  test('lays the events out in a row when horizontal', async ({ page }) => {
    const top = example(page, 'Horizontal').getByRole('list', { name: 'Release plan, line above' });
    const markers = top.locator('.tx-timeline__marker');
    const y = await centerY(markers.first());
    for (const index of [1, 2, 3]) {
      expect(Math.abs((await centerY(markers.nth(index))) - y)).toBeLessThan(1);
      expect(await centerX(markers.nth(index))).toBeGreaterThan(
        await centerX(markers.nth(index - 1)),
      );
    }
    expect(await centerY(top.getByText('2023', { exact: true }))).toBeGreaterThan(y);
    const bottom = example(page, 'Horizontal').getByRole('list', {
      name: 'Release plan, line below',
    });
    expect(await centerY(bottom.getByText('2023', { exact: true }))).toBeLessThan(
      await centerY(bottom.locator('.tx-timeline__marker').first()),
    );
  });
});
