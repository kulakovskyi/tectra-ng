import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';
import { expect, test } from './fixtures';
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

test('a new column slides in and options change colour smoothly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await example(page, 'Basic').getByRole('combobox').click();
  const option = page.getByRole('treeitem', { name: 'Poland' });
  expect(parseFloat(await option.evaluate((element) => getComputedStyle(element).transitionDuration))).toBeGreaterThan(0);
  await option.hover();
  const column = page.locator('.tx-cascade-select__column').nth(1);
  await expect(column).toContainText('Masovia');
  expect(await column.evaluate((element) => element.getAnimations().length)).toBeGreaterThan(0);
});
