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
  await expect(page.locator('body > tx-toast')).toContainText('Reminder sent for INV-1044');
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
    const watching = page.evaluate(
      () =>
        new Promise<number[]>((resolve) => {
          const heights: number[] = [];
          const start = performance.now();
          const tick = () => {
            const element = document.querySelector('.tx-table__expansion-body');
            heights.push(element ? element.getBoundingClientRect().height : 0);
            if (performance.now() - start < 700) requestAnimationFrame(tick);
            else resolve(heights);
          };
          requestAnimationFrame(tick);
        }),
    );
    await toggle.click();
    const body = frame.locator('.tx-table__expansion-body').first();
    const heights = await watching;
    const final = Math.max(...heights);
    expect(heights.some((height) => height > 0 && height < final)).toBe(true);
    await expect.poll(() => body.evaluate((element) => element.getAnimations().length)).toBe(0);
    const open = await body.evaluate((element) => element.getBoundingClientRect().height);
    expect(open).toBeGreaterThan(60);
    const opened = await body.elementHandle();
    await frame.getByRole('button', { name: 'Collapse row' }).first().click();
    await expect.poll(() => opened?.evaluate((element) => (element.isConnected ? element.getBoundingClientRect().height : 0))).toBeLessThan(open);
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

test('a tooltip inside a popover stays on its button while the page scrolls', async ({ page }) => {
  const frame = example(page, 'Row actions');
  const more = frame.getByRole('button', { name: 'More actions' }).nth(2);
  await more.scrollIntoViewIfNeeded();
  await more.click();
  const remove = page.locator('.tx-popover').last().getByRole('button', { name: 'Delete' });
  await page.mouse.move(0, 0);
  await page.keyboard.press('Tab');
  await expect(remove).toBeFocused();
  await expect(page.locator('tx-tooltip')).toBeVisible();
  const gaps = await remove.evaluate(async (button) => {
    const result: number[] = [];
    for (let step = 0; step < 4; step++) {
      window.scrollBy(0, 40);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const tooltip = document.querySelector('tx-tooltip');
      if (!tooltip) break;
      result.push(Math.round(tooltip.getBoundingClientRect().bottom - button.getBoundingClientRect().top));
    }
    return result;
  });
  expect(gaps).toHaveLength(4);
  expect(new Set(gaps).size).toBe(1);
});

test('row action buttons work from the keyboard', async ({ page }) => {
  const frame = example(page, 'Row actions');
  const open = frame.getByRole('button', { name: 'Open' }).first();
  await open.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('body > tx-toast')).toContainText('Opened INV-1042');
  await frame.getByRole('button', { name: 'Download' }).nth(1).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('body > tx-toast')).toContainText('Downloaded INV-1043');
});

test('the filter menu applies rules typed from the keyboard', async ({ page }) => {
  const frame = example(page, 'Filter menu');
  const rows = frame.locator('tbody tr.tx-table__row');
  await expect(rows).toHaveCount(5);
  await frame.getByRole('button', { name: 'Filter Client' }).click();
  const panel = page.getByRole('dialog', { name: 'Filter Client' });
  await panel.getByRole('textbox', { name: 'Client: Value' }).fill('s');
  await panel.getByRole('button', { name: 'Apply' }).click();
  await expect(rows).toHaveCount(0);
  await expect(frame.getByText('Active filters: amount, client')).toBeVisible();
  await frame.getByRole('button', { name: 'Filter Amount' }).click();
  await page.getByRole('dialog', { name: 'Filter Amount' }).getByRole('button', { name: 'Clear' }).click();
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('Silverleaf');
  await expect(frame.getByText('Active filters: client')).toBeVisible();
});

test('the filter row and the global search filter while typing', async ({ page }) => {
  const frame = example(page, 'Filter row');
  const rows = frame.locator('tbody tr.tx-table__row');
  await frame.getByRole('textbox', { name: 'City: Value' }).pressSequentially('ky');
  await expect(rows).toHaveCount(2);
  await frame.getByRole('textbox', { name: 'City: Value' }).fill('');
  await frame.getByRole('searchbox', { name: 'Search invoices' }).pressSequentially('maple');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('Maple & Co');
});

test('a cell is edited with the keyboard', async ({ page }) => {
  const frame = example(page, 'Cell edit');
  const cell = frame.locator('tbody tr').first().locator('td[data-field="client"]');
  await cell.focus();
  await page.keyboard.press('Enter');
  const input = cell.getByRole('textbox');
  await expect(input).toBeFocused();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('North Studio');
  await page.keyboard.press('Tab');
  await expect(frame.locator('tbody tr').first().locator('td[data-field="amount"] input')).toBeFocused();
  await expect(cell).toHaveText('North Studio');
  await expect(frame.getByText('client: Northwind Studio → North Studio')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(frame.locator('td[data-field="amount"] input')).toHaveCount(0);
});

test('rows drag along the column only and keep the new order', async ({ page }) => {
  const frame = example(page, 'Row reorder');
  const handles = frame.getByRole('button', { name: 'Move row' });
  await handles.first().scrollIntoViewIfNeeded();
  const from = await handles.first().boundingBox();
  const target = await frame.locator('tbody tr').nth(2).boundingBox();
  const body = await frame.locator('tbody').boundingBox();
  if (!from || !target || !body) throw new Error('rows are not visible');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + 200, from.y + 20, { steps: 4 });
  await page.mouse.move(from.x + 300, target.y + target.height / 2 + 5, { steps: 8 });
  const preview = await page.locator('.tx-table__row.cdk-drag-preview').boundingBox();
  if (!preview) throw new Error('no drag preview');
  expect(Math.abs(preview.x - body.x)).toBeLessThan(2);
  await page.mouse.up();
  await expect(frame.getByText('Order: 2, 3, 1, 4, 5')).toBeVisible();
  await handles.first().focus();
  await page.keyboard.press('Alt+ArrowDown');
  await expect(frame.getByText('Order: 3, 2, 1, 4, 5')).toBeVisible();
});

test('virtual scroll renders a window of rows and reaches the last one with End', async ({ page }) => {
  const frame = example(page, 'Virtual scroll');
  const rows = frame.locator('tbody tr.tx-table__row');
  expect(await rows.count()).toBeLessThan(40);
  await rows.first().click();
  await page.keyboard.press('End');
  await expect(frame.locator('tbody tr.tx-table__row[data-key="10000"]')).toBeFocused();
  expect(await rows.count()).toBeLessThan(40);
});

test('the export button downloads a csv file', async ({ page }) => {
  const frame = example(page, 'Export');
  const [download] = await Promise.all([page.waitForEvent('download'), frame.getByRole('button', { name: 'Export CSV' }).click()]);
  expect(download.suggestedFilename()).toBe('contacts.csv');
});

test('the filter row sits under the header with a single border', async ({ page }) => {
  const frame = example(page, 'Filter row');
  const widths = await frame.evaluate((root) => {
    const header = root.querySelector('thead tr:first-child th') as Element;
    const cell = root.querySelector('.tx-table__filter-cell') as Element;
    return [getComputedStyle(header).borderBottomWidth, getComputedStyle(cell).borderTopWidth];
  });
  expect(widths).toEqual(['1px', '0px']);
});

test.describe('group motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('a row group collapses and opens like an accordion', async ({ page }) => {
    const frame = example(page, 'Row group');
    const toggle = frame.locator('.tx-table__group-header .tx-table__row-toggle').first();
    await toggle.scrollIntoViewIfNeeded();
    const heights = await toggle.evaluate(async (button) => {
      const row = () => (button.closest('tx-table') as Element).querySelectorAll('.tx-table__tbody > .tx-table__row')[0];
      const seen: number[] = [];
      (button as HTMLElement).click();
      for (let frame = 0; frame < 8; frame++) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        seen.push(Math.round(row().getBoundingClientRect().height));
      }
      return seen;
    });
    expect(heights.some((height) => height > 5 && height < 45)).toBe(true);
    await expect.poll(() => frame.locator('.tx-table__row--collapsed').first().evaluate((row) => row.getBoundingClientRect().height)).toBe(0);
    await toggle.click();
    await expect.poll(() => frame.locator('.tx-table__tbody > .tx-table__row').first().evaluate((row) => Math.round(row.getBoundingClientRect().height))).toBe(50);
  });
});
