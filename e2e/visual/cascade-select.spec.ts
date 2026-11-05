import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { setDarkMode } from './helpers';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.beforeEach(async ({ page }) => {
  await page.goto('/components/cascade-select');
  await page.locator('main h1').first().waitFor();
});

for (const mode of ['light', 'dark'] as const) {
  test(`open columns are accessible — ${mode}`, async ({ page }) => {
    if (mode === 'dark') {
      await setDarkMode(page);
    }
    await example(page, 'Path').getByRole('combobox').click();
    await expect(page.locator('.tx-cascade-select__column')).toHaveCount(3);
    const axe = await new AxeBuilder({ page }).include('.tx-select__panel').analyze();
    expect(axe.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical').map((violation) => violation.id)).toEqual([]);
  });
}

test('columns open with the keys and a leaf is picked', async ({ page }) => {
  const frame = example(page, 'Basic');
  const trigger = frame.getByRole('combobox');
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.tx-cascade-select__option--active')).toHaveText('Kraków');
  await page.keyboard.press('Enter');
  await expect(frame.getByText('Value: PL-KRK')).toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText('Kraków');
});
