import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { setDarkMode } from './helpers';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });
const panel = (page: Page) => page.locator('.tx-select__panel');

test.beforeEach(async ({ page }) => {
  await page.goto('/components/autocomplete');
  await page.locator('main h1').first().waitFor();
});

for (const mode of ['light', 'dark'] as const) {
  test(`open suggestions are accessible — ${mode}`, async ({ page }) => {
    if (mode === 'dark') {
      await setDarkMode(page);
    }
    await example(page, 'Groups').getByRole('button', { name: 'Show options' }).click();
    await expect(panel(page)).toBeVisible();
    const axe = await new AxeBuilder({ page }).include('.tx-select__panel').analyze();
    expect(axe.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical').map((violation) => violation.id)).toEqual([]);
  });
}

test('typing asks for suggestions and Enter takes the active one', async ({ page }) => {
  const frame = example(page, 'Basic');
  const input = frame.getByRole('combobox');
  await input.pressSequentially('ber');
  await expect(page.getByRole('option')).toHaveText(['Blackberry', 'Blueberry']);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('Blueberry');
  await expect(frame.getByText('Value: Blueberry')).toBeVisible();
  await expect(panel(page)).toHaveCount(0);
});

test('forced selection clears unknown text on Tab and takes a match', async ({ page }) => {
  const frame = example(page, 'Force selection');
  const input = frame.getByRole('combobox');
  await input.fill('Atlantis');
  await page.keyboard.press('Tab');
  await expect(input).toHaveValue('');
  await input.focus();
  await input.pressSequentially('Ukr');
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('Ukraine');
  await expect(frame.getByText('Value: UA')).toBeVisible();
});

test('chips are added from suggestions and removed with Backspace', async ({ page }) => {
  const frame = example(page, 'Multiple');
  const input = frame.getByRole('combobox');
  const chips = frame.locator('.tx-select__chip:not(.tx-select__chip--more)');
  await input.pressSequentially('mykola');
  await page.getByRole('option', { name: 'mykola@example.com' }).click();
  await expect(chips).toHaveText(['olena@example.com', 'taras@example.com', 'iryna@example.com', 'mykola@example.com']);
  await expect(input).toBeFocused();
  await page.keyboard.press('Backspace');
  await expect(chips).toHaveText(['olena@example.com', 'taras@example.com', 'iryna@example.com']);
});

test('chips stay on one line with a +N chip until the field has focus', async ({ page }) => {
  const frame = example(page, 'Multiple');
  const input = frame.getByRole('combobox');
  const box = frame.locator('.tx-select__box');
  const shown = frame.locator('.tx-select__chip:not(.tx-select__chip--more):not(.tx-select__chip--hidden)');
  const more = frame.locator('.tx-select__chip--more');
  await expect(more).toHaveText(/^\+\d$/);
  const folded = (await box.boundingBox())?.height ?? 0;
  expect(await shown.count()).toBeLessThan(3);
  await input.focus();
  await expect(shown).toHaveCount(3);
  await expect(more).toHaveClass(/tx-select__chip--hidden/);
  expect((await box.boundingBox())?.height ?? 0).toBeGreaterThan(folded);
  await input.blur();
  await expect(more).not.toHaveClass(/tx-select__chip--hidden/);
});
