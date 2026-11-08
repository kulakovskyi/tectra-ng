import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';
import { expect, test } from './fixtures';
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

test('branches open and close like an accordion and leaves have no toggle square', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const trigger = example(page, 'Filter').getByRole('combobox');
  await trigger.click();
  const engineering = page.getByRole('treeitem', { name: 'Engineering' });
  expect(parseFloat(await engineering.evaluate((element) => getComputedStyle(element).transitionDuration))).toBeGreaterThan(0);
  const group = page.locator('.tx-tree-select__children').first();
  await expect(group).toHaveCSS('grid-template-rows', '0px');
  await engineering.locator('.tx-tree-select__toggler').click();
  const heights: number[] = [];
  for (let frame = 0; frame < 6; frame += 1) {
    heights.push(await group.evaluate((element) => element.getBoundingClientRect().height));
    await page.waitForTimeout(30);
  }
  expect(heights[0]).toBeLessThan(heights[heights.length - 1]);
  expect(new Set(heights).size).toBeGreaterThan(2);
  const web = page.getByRole('treeitem', { name: 'Web' });
  await expect(web).toBeVisible();
  await expect(engineering.locator('.tx-tree-select__chevron')).toHaveCSS('transform', /matrix\(0, 1, -1, 0/);
  const api = page.getByRole('treeitem', { name: 'API' });
  await api.locator('.tx-tree-select__toggler').hover();
  await expect(api.locator('.tx-tree-select__toggler')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await engineering.locator('.tx-tree-select__toggler').click();
  await expect(web).toBeHidden();
});
