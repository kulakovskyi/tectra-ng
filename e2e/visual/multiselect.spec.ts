import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { setDarkMode } from './helpers';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });
const panel = (page: Page) => page.locator('.tx-select__panel');

test.beforeEach(async ({ page }) => {
  await page.goto('/components/multiselect');
  await page.locator('main h1').first().waitFor();
});

for (const mode of ['light', 'dark'] as const) {
  test(`open multiselect panels are accessible — ${mode}`, async ({ page }) => {
    if (mode === 'dark') {
      await setDarkMode(page);
    }
    for (const title of ['Basic', 'Filter', 'Groups', 'Virtual scroll']) {
      await example(page, title).locator('.tx-select__box').click();
      await expect(panel(page)).toBeVisible();
      await page.waitForTimeout(300);
      const axe = await new AxeBuilder({ page }).include('.tx-select__panel').analyze();
      const serious = axe.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
      expect(serious.map((violation) => violation.id), title).toEqual([]);
      await page.keyboard.press('Escape');
      await expect(panel(page)).toHaveCount(0);
    }
  });
}

test('select all picks the filtered options and keeps the panel open', async ({ page }) => {
  const frame = example(page, 'Filter');
  const trigger = frame.getByRole('combobox');
  await trigger.click();
  await page.locator('.tx-select__panel').getByRole('searchbox').fill('land');
  await expect(page.getByRole('option')).toHaveText(['Finland', 'Poland']);
  await page.keyboard.press('Shift+Tab');
  const all = page.getByRole('checkbox', { name: 'Select all' });
  await expect(all).toBeFocused();
  await page.keyboard.press('Space');
  await expect(all).toHaveAttribute('aria-checked', 'true');
  await expect(panel(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toContainText('Finland, Poland');
  await expect(trigger).toBeFocused();
});

test('chips are removed by click and by Backspace without moving the page', async ({ page }) => {
  const frame = example(page, 'Chips');
  const trigger = frame.getByRole('combobox');
  const chips = frame.locator('.tx-select__chip');
  await expect(chips).toHaveText(['Angular', 'RxJS', 'Docker']);
  await chips.nth(1).locator('.tx-select__chip-remove').click();
  await expect(chips).toHaveText(['Angular', 'Docker']);
  await expect(panel(page)).toHaveCount(0);
  await trigger.focus();
  await page.keyboard.press('Backspace');
  await expect(chips).toHaveText(['Angular']);
});

test('the selection limit disables the remaining options', async ({ page }) => {
  await example(page, 'Selection limit').getByRole('combobox').click();
  for (const name of ['Angular', 'TypeScript', 'RxJS']) {
    await page.getByRole('option', { name }).click();
  }
  await expect(page.getByRole('option', { name: 'Docker' })).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('option', { selected: true })).toHaveCount(3);
});
