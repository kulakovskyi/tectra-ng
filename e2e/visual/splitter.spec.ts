import { Locator, Page, expect, test } from '@playwright/test';

const example = (page: Page, id: string) => page.locator(`splitter-${id}-example`);
const panels = (root: Locator) => root.locator('tx-splitter > .tx-splitter__panel');

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

async function dragBy(page: Page, gutter: Locator, dx: number, dy = 0): Promise<void> {
  await gutter.scrollIntoViewIfNeeded();
  const rect = await box(gutter);
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 4 });
  await page.mouse.move(x + dx, y + dy, { steps: 4 });
  await page.mouse.up();
}

test.describe('splitter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/splitter');
    await page.locator('main h1').first().waitFor();
  });

  test('dragging the gutter moves the space between the panels', async ({ page }) => {
    const root = example(page, 'basic');
    const first = panels(root).first();
    const before = await box(first);
    await dragBy(page, root.getByRole('separator'), 80);
    const after = await box(first);
    expect(after.width - before.width).toBeGreaterThan(70);
    expect(after.width - before.width).toBeLessThan(90);
  });

  test('arrow keys move the gutter of its layout', async ({ page }) => {
    const gutter = example(page, 'basic').getByRole('separator');
    await gutter.focus();
    await expect(gutter).toHaveAttribute('aria-valuenow', '50');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => Number(await gutter.getAttribute('aria-valuenow'))).toBeGreaterThan(50);
    await page.keyboard.press('ArrowDown');
    const vertical = example(page, 'vertical').getByRole('separator').first();
    await expect(vertical).toHaveAttribute('aria-orientation', 'horizontal');
    const top = panels(example(page, 'vertical')).first();
    const before = await box(top);
    await vertical.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    expect((await box(top)).height).toBeGreaterThan(before.height + 5);
  });

  test('panels keep their minimum and maximum', async ({ page }) => {
    const root = example(page, 'sizes');
    const gutter = root.getByRole('separator');
    const splitter = await box(root.locator('tx-splitter'));
    await dragBy(page, gutter, -splitter.width);
    await expect(root.getByText('Sizes: 20% / 80%')).toBeVisible();
    await dragBy(page, gutter, splitter.width);
    await expect(root.getByText('Sizes: 50% / 50%')).toBeVisible();
    await gutter.focus();
    await page.keyboard.press('Home');
    await expect(gutter).toHaveAttribute('aria-valuenow', '20');
  });

  test('a collapsible panel snaps shut and opens again at its minimum', async ({ page }) => {
    const root = example(page, 'collapsible');
    const gutter = root.getByRole('separator');
    const splitter = await box(root.locator('tx-splitter'));
    await dragBy(page, gutter, -splitter.width * 0.15);
    await expect(root.getByText('Sidebar is collapsed')).toBeVisible();
    expect((await box(panels(root).first())).width).toBeLessThan(2);
    await dragBy(page, gutter, 20);
    await expect(root.getByText('Sidebar is open')).toBeVisible();
    expect((await box(panels(root).first())).width).toBeGreaterThan(splitter.width * 0.19);
    await gutter.focus();
    await page.keyboard.press('Enter');
    await expect(root.getByText('Sidebar is collapsed')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(root.getByText('Sidebar is open')).toBeVisible();
  });

  test('stored sizes come back after a reload and reset clears them', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('docs-splitter-state'));
    await page.reload();
    const root = example(page, 'stateful');
    const gutter = root.getByRole('separator');
    await expect(gutter).toHaveAttribute('aria-valuenow', '40');
    await gutter.focus();
    await page.keyboard.press('End');
    await expect.poll(async () => Number(await gutter.getAttribute('aria-valuenow'))).toBeGreaterThan(90);
    const stored = await gutter.getAttribute('aria-valuenow');
    await page.reload();
    await expect(example(page, 'stateful').getByRole('separator')).toHaveAttribute('aria-valuenow', stored ?? '');
    await example(page, 'stateful').getByRole('button', { name: 'Reset sizes' }).click();
    await expect(example(page, 'stateful').getByRole('separator')).toHaveAttribute('aria-valuenow', '40');
  });

  test('a disabled splitter does not resize', async ({ page }) => {
    const root = example(page, 'disabled');
    const first = panels(root).first();
    const before = await box(first);
    await dragBy(page, root.getByRole('separator'), 80);
    expect((await box(first)).width).toBeCloseTo(before.width, 0);
    await root.getByRole('button', { name: 'Unlock layout' }).click();
    await dragBy(page, root.getByRole('separator'), 80);
    expect((await box(first)).width).toBeGreaterThan(before.width + 70);
  });
});
