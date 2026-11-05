import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { setDarkMode } from './helpers';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.beforeEach(async ({ page }) => {
  await page.goto('/components/tree-select');
  await page.locator('main h1').first().waitFor();
});

for (const mode of ['light', 'dark'] as const) {
  test(`open tree is accessible — ${mode}`, async ({ page }) => {
    if (mode === 'dark') {
      await setDarkMode(page);
    }
    await example(page, 'Checkbox').getByRole('combobox').click();
    await expect(page.getByRole('tree')).toBeVisible();
    const axe = await new AxeBuilder({ page }).include('.tx-select__panel').analyze();
    expect(axe.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical').map((violation) => violation.id)).toEqual([]);
  });
}

test('tree opens branches with the arrows and picks a leaf', async ({ page }) => {
  const frame = example(page, 'Basic');
  const trigger = frame.getByRole('combobox');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('treeitem', { name: 'API' })).toHaveClass(/--active/);
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('treeitem', { name: 'UI kit' })).toHaveClass(/--active/);
  await page.keyboard.press('Enter');
  await expect(frame.getByText('Value: web-ui')).toBeVisible();
  await expect(trigger).toBeFocused();
});

test('checking a branch checks its children', async ({ page }) => {
  const frame = example(page, 'Checkbox');
  await frame.getByRole('combobox').click();
  await page.getByRole('treeitem', { name: 'Business' }).locator('.tx-tree-select__label').click();
  await expect(page.getByRole('treeitem', { name: 'Business' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('treeitem', { name: 'Business' }).locator('.tx-tree-select__toggler').click();
  await expect(page.getByRole('treeitem', { name: 'Sales' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('treeitem', { name: 'Engineering' })).toHaveAttribute('aria-checked', 'mixed');
});

test('branches open and close with motion and hovers are smooth', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const trigger = example(page, 'Filter').getByRole('combobox');
  await trigger.click();
  const engineering = page.getByRole('treeitem', { name: 'Engineering' });
  const transition = await engineering.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(parseFloat(transition)).toBeGreaterThan(0);
  await engineering.locator('.tx-tree-select__toggler').click();
  const child = page.getByRole('treeitem', { name: 'Web' });
  await expect(child).toBeVisible();
  expect(await child.evaluate((element) => element.getAnimations().length)).toBeGreaterThan(0);
  await expect(engineering.locator('.tx-tree-select__chevron')).toHaveCSS('transform', /matrix\(0, 1, -1, 0/);
  await engineering.locator('.tx-tree-select__toggler').click();
  await expect(child).toHaveCount(0);
});
