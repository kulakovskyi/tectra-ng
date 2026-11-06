import { Page, expect, test } from '@playwright/test';
import { layoutViewport } from './helpers';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

const panel = (page: Page) => page.locator('.cdk-overlay-pane .tx-datepicker__panel');

test.describe('datepicker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/datepicker');
    await page.locator('main h1').first().waitFor();
  });

  test('opens under the field, picks a day and closes', async ({ page }) => {
    const field = example(page, 'Basic').getByRole('combobox', { name: 'Delivery date' });
    await field.click();
    await expect(panel(page)).toBeVisible();
    const fieldBox = await field.boundingBox();
    const panelBox = await panel(page).boundingBox();
    expect(panelBox?.y ?? 0).toBeGreaterThanOrEqual((fieldBox?.y ?? 0) + (fieldBox?.height ?? 0));
    expect(Math.abs((panelBox?.x ?? 0) - (fieldBox?.x ?? 0))).toBeLessThan(2);
    await panel(page)
      .locator('td.tx-datepicker__day-cell:not(.tx-datepicker__day-cell--other)[data-date$="-15"]')
      .click();
    await expect(panel(page)).toBeHidden();
    await expect(field).toHaveValue(/\/15\//);
    await expect(example(page, 'Basic').getByText(/Value: \w{3} \w{3} 15 \d{4}/)).toBeVisible();
  });

  test('parses typed dates and formats them on blur', async ({ page }) => {
    const field = example(page, 'Format').getByRole('combobox', { name: 'dd.mm.yy' });
    await field.fill('3.11.2026');
    await field.press('Tab');
    await expect(field).toHaveValue('03.11.2026');
    await expect(example(page, 'Format').getByRole('combobox', { name: 'yy-mm-dd' })).toHaveValue(
      '2026-11-03',
    );
    await expect(example(page, 'Format').getByRole('combobox', { name: 'MM d, yy' })).toHaveValue(
      'November 3, 2026',
    );
  });

  test('walks the grid with the keyboard', async ({ page }) => {
    const field = example(page, 'Format').getByRole('combobox', { name: 'dd.mm.yy' });
    await field.focus();
    await field.press('ArrowDown');
    const focused = page.locator('.tx-datepicker__day-cell:focus');
    await expect(focused).toHaveAttribute('data-date', '2026-10-31');
    await page.keyboard.press('ArrowRight');
    await expect(focused).toHaveAttribute('data-date', '2026-11-01');
    await page.keyboard.press('PageDown');
    await expect(focused).toHaveAttribute('data-date', '2026-12-01');
    await page.keyboard.press('Enter');
    await expect(field).toHaveValue('01.12.2026');
    await expect(field).toBeFocused();
  });

  test('selects a range and highlights the days between', async ({ page }) => {
    const field = example(page, 'Range').getByRole('combobox', { name: 'Report period' });
    await field.click();
    const days = panel(page).locator(
      'td.tx-datepicker__day-cell:not(.tx-datepicker__day-cell--other)',
    );
    await days.nth(4).click();
    await expect(example(page, 'Range').getByText('Now pick the last day.')).toBeVisible();
    await days.nth(10).hover();
    await expect(panel(page).locator('.tx-datepicker__day--preview')).toHaveCount(6);
    await panel(page)
      .locator('.tx-datepicker__day-view')
      .hover({ position: { x: 2, y: 2 } });
    await page.mouse.move(0, 0);
    await expect(panel(page).locator('.tx-datepicker__day--preview')).toHaveCount(0);
    await days.nth(10).click();
    await expect(example(page, 'Range').getByText('7 days')).toBeVisible();
    await field.click();
    await expect(panel(page).locator('.tx-datepicker__day--range')).toHaveCount(5);
  });

  test('picks a day of the next month shown in the grid', async ({ page }) => {
    const field = example(page, 'Format').getByRole('combobox', { name: 'dd.mm.yy' });
    await field.click();
    await panel(page).locator('td.tx-datepicker__day-cell--other[data-date="2026-11-01"]').click();
    await expect(field).toHaveValue('01.11.2026');
  });

  test('keeps the clear button off the icon button', async ({ page }) => {
    const frame = example(page, 'Icon');
    const clear = frame.getByRole('button', { name: 'Clear' });
    const button = frame.locator('tx-datepicker').nth(2).locator('.tx-datepicker__dropdown');
    const clearBox = await clear.boundingBox();
    const buttonBox = await button.boundingBox();
    expect((clearBox?.x ?? 0) + (clearBox?.width ?? 0)).toBeLessThanOrEqual(buttonBox?.x ?? 0);
  });

  test('opens the touch calendar in the middle over a mask', async ({ page }) => {
    await example(page, 'Touch').getByRole('combobox', { name: 'Birthday' }).click();
    const dialog = page.getByRole('dialog', { name: 'Birthday' });
    await expect(dialog).toBeVisible();
    await expect(page.locator('.tx-datepicker-mask')).toBeVisible();
    const box = await dialog.boundingBox();
    const viewport = await layoutViewport(page);
    expect(Math.abs((box?.x ?? 0) + (box?.width ?? 0) / 2 - viewport.width / 2)).toBeLessThan(2);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
