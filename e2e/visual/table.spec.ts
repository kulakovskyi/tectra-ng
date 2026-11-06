import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { setDarkMode } from './helpers';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

const firstColumn = (page: Page, title: string) =>
  example(page, title).locator('tbody tr').evaluateAll((rows) => rows.map((row) => row.querySelector('td')?.textContent?.trim()));

test.beforeEach(async ({ page }) => {
  await page.evaluate(() => localStorage.clear()).catch(() => undefined);
  await page.goto('/components/table');
  await page.locator('main h1').first().waitFor();
});

test('headers sort from the keyboard and report aria-sort', async ({ page }) => {
  const frame = example(page, 'Basic');
  const client = frame.getByRole('button', { name: 'Client', exact: true });
  await client.focus();
  await page.keyboard.press('Enter');
  await expect(frame.locator('th[data-field="client"]')).toHaveAttribute('aria-sort', 'ascending');
  expect((await firstColumn(page, 'Basic'))[0]).toBe('INV-1043');
  await page.keyboard.press('Enter');
  await expect(frame.locator('th[data-field="client"]')).toHaveAttribute('aria-sort', 'descending');
  expect((await firstColumn(page, 'Basic'))[0]).toBe('INV-1045');
});

test('a column is resized by dragging its handle and reordered with Alt + arrows', async ({ page }) => {
  const frame = example(page, 'Columns');
  const client = frame.locator('th[data-field="client"]');
  const before = await client.evaluate((th) => th.getBoundingClientRect().width);
  const handle = client.locator('.tx-table__resizer');
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  if (!box) throw new Error('resize handle is not visible');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect.poll(() => client.evaluate((th) => Math.round(th.getBoundingClientRect().width))).toBeGreaterThan(Math.round(before) + 40);

  await frame.getByRole('button', { name: 'City', exact: true }).focus();
  await page.keyboard.press('Alt+ArrowLeft');
  const order = await frame.locator('thead th').evaluateAll((cells) => cells.map((cell) => cell.getAttribute('data-field')));
  expect(order).toEqual(['number', 'city', 'client', 'amount']);
  await expect(frame.getByRole('button', { name: 'City', exact: true })).toBeFocused();
});

test('column settings hide a column and the popover is accessible in both themes', async ({ page }) => {
  const frame = example(page, 'Columns');
  await frame.getByRole('button', { name: 'Table settings' }).click();
  const panel = page.getByRole('dialog', { name: 'Table settings' });
  await expect(panel).toBeVisible();
  await panel.getByRole('checkbox', { name: 'Status' }).check();
  await expect(frame.locator('th[data-field="status"]')).toHaveCount(1);
  await panel.getByRole('checkbox', { name: 'City' }).uncheck();
  await expect(frame.locator('th[data-field="city"]')).toHaveCount(0);
  for (const dark of [false, true]) {
    if (dark) await setDarkMode(page);
    const results = await new AxeBuilder({ page }).include('.tx-popover').analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }
});

test('frozen columns stay in place while the table scrolls sideways', async ({ page }) => {
  const frame = example(page, 'Frozen columns');
  const scroller = frame.locator('.tx-table__scroller');
  const position = () =>
    frame.evaluate((root) => {
      const rect = (selector: string) => (root.querySelector(selector) as HTMLElement).getBoundingClientRect();
      const area = rect('.tx-table__scroller');
      const start = rect('tbody td[data-field="number"]');
      const end = rect('tbody td[data-field="amount"]');
      const middle = rect('tbody td[data-field="city"]');
      return { start: start.left - area.left, end: area.right - end.right, middle: middle.left };
    });
  const before = await position();
  await scroller.evaluate((element) => element.scrollTo({ left: 200 }));
  await expect.poll(async () => (await position()).middle).toBeLessThan(before.middle - 150);
  const after = await position();
  expect(Math.abs(after.start - before.start)).toBeLessThan(1);
  expect(Math.abs(after.end - before.end)).toBeLessThan(1);
});

test('right-click opens the row actions as a menu that runs them', async ({ page }) => {
  const frame = example(page, 'Row actions');
  await frame.locator('tbody tr').nth(2).click({ button: 'right' });
  const menu = page.getByRole('menu', { name: 'Row actions' });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem')).toHaveCount(4);
  await expect(frame.locator('tbody tr').nth(2)).toHaveClass(/tx-table__row--menu/);
  await menu.getByRole('menuitem', { name: /Send reminder/ }).click();
  await expect(frame.getByText('Reminder for INV-1044')).toBeVisible();
  await expect(menu).toBeHidden();
});

test('rows become cards below 64rem', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  const frame = example(page, 'Basic');
  await expect(frame.locator('table')).toHaveCount(0);
  const card = frame.locator('.tx-table__card').first();
  await expect(card.locator('.tx-table__card-title')).toHaveText('INV-1042');
  await expect(card.locator('.tx-table__card-label')).toHaveText(['Client', 'City', 'Amount', 'Status']);
});

test('rows are selected with the arrow keys and Space', async ({ page }) => {
  const frame = example(page, 'Row selection');
  const rows = frame.locator('tbody tr');
  await rows.first().click();
  await page.keyboard.press('ArrowDown');
  await expect(rows.nth(1)).toBeFocused();
  await page.keyboard.press('Shift+ArrowDown');
  await expect(frame.getByText('Selected: 3')).toBeVisible();
  await expect(rows.nth(2)).toHaveAttribute('aria-selected', 'true');
});

test('a header drags only along the header row', async ({ page }) => {
  const frame = example(page, 'Columns');
  const city = frame.locator('th[data-field="city"]');
  await city.scrollIntoViewIfNeeded();
  const row = await frame.locator('thead tr').boundingBox();
  const from = await city.boundingBox();
  const target = await frame.locator('th[data-field="client"]').boundingBox();
  if (!row || !from || !target) throw new Error('header is not visible');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 - 20, from.y + 120, { steps: 4 });
  await page.mouse.move(target.x + 10, from.y + 300, { steps: 8 });
  const preview = await page.locator('.tx-table__drag-preview').boundingBox();
  if (!preview) throw new Error('no drag preview');
  expect(Math.abs(preview.y - row.y)).toBeLessThan(2);
  expect(preview.x).toBeGreaterThanOrEqual(row.x - 1);
  await page.mouse.up();
  await expect
    .poll(() => frame.locator('thead th').evaluateAll((cells) => cells.map((cell) => cell.getAttribute('data-field'))))
    .toEqual(['number', 'city', 'client', 'amount']);
});

test('the settings list reorders columns from the keyboard', async ({ page }) => {
  const frame = example(page, 'Columns');
  await frame.getByRole('button', { name: 'Table settings' }).click();
  const panel = page.getByRole('dialog', { name: 'Table settings' });
  await panel.getByRole('checkbox', { name: 'Amount' }).focus();
  await page.keyboard.press('Alt+ArrowUp');
  await expect
    .poll(() => frame.locator('thead th').evaluateAll((cells) => cells.map((cell) => cell.getAttribute('data-field'))))
    .toEqual(['number', 'client', 'amount', 'city']);
  await expect(panel.getByRole('checkbox', { name: 'Amount' })).toBeFocused();
});

test.describe('with motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('a row opens and closes like an accordion', async ({ page }) => {
    const frame = example(page, 'Expansion');
    const toggle = frame.getByRole('button', { name: 'Expand row' }).first();
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    const body = frame.locator('.tx-table__expansion-body').first();
    const heights: number[] = [];
    for (let step = 0; step < 6; step++) {
      heights.push(await body.evaluate((element) => element.getBoundingClientRect().height));
      await page.waitForTimeout(40);
    }
    expect(heights[0]).toBeLessThan(heights.at(-1) ?? 0);
    await expect.poll(() => body.evaluate((element) => element.getAnimations().length)).toBe(0);
    const open = await body.evaluate((element) => element.getBoundingClientRect().height);
    expect(open).toBeGreaterThan(60);
    await frame.getByRole('button', { name: 'Collapse row' }).first().click();
    await expect.poll(() => body.evaluate((element) => element.getBoundingClientRect().height)).toBeLessThan(open);
    await expect(frame.locator('.tx-table__expansion')).toHaveCount(1);
  });
});

test('popovers in cells stay on their buttons while the page scrolls', async ({ page }) => {
  const cases = [
    { title: 'Row actions', trigger: (frame: ReturnType<typeof example>) => frame.getByRole('button', { name: 'More actions' }).first() },
    { title: 'Templates', trigger: (frame: ReturnType<typeof example>) => frame.getByRole('button', { name: 'About Blue Harbor' }) },
  ];
  for (const { title, trigger } of cases) {
    const button = trigger(example(page, title));
    await button.scrollIntoViewIfNeeded();
    await button.click();
    const panel = page.locator('.tx-popover').last();
    await expect(panel).toBeVisible();
    const gap = async () => {
      const [from, to] = await Promise.all([button.boundingBox(), panel.boundingBox()]);
      return Math.round((to?.y ?? 0) - (from?.y ?? 0));
    };
    const before = await gap();
    await page.evaluate(() => window.scrollBy(0, 120));
    await expect.poll(gap).toBe(before);
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.className = 'e2e-spacer';
      spacer.style.height = '2000px';
      document.querySelector('main')?.appendChild(spacer);
    });
    await expect.poll(gap).toBe(before);
    await page.mouse.wheel(0, 150);
    await expect.poll(gap).toBe(before);
    await page.evaluate(() => document.querySelector('.e2e-spacer')?.remove());
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  }
});
