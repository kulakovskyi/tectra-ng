import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { setDarkMode } from './helpers';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });
const panel = (page: Page) => page.locator('.tx-select__panel');

async function seriousViolations(page: Page): Promise<string[]> {
  const axe = await new AxeBuilder({ page }).include('.tx-select__panel').analyze();
  return axe.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).slice(0, 3).join(', ')}`);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/components/select');
  await page.locator('main h1').first().waitFor();
});

for (const mode of ['light', 'dark'] as const) {
  test(`open grouped and virtual panels are accessible — ${mode}`, async ({ page }) => {
    if (mode === 'dark') {
      await setDarkMode(page);
    }
    for (const title of ['Groups', 'Disabled options', 'Virtual scroll', 'Lazy']) {
      await example(page, title).locator('.tx-select__box').click();
      await expect(panel(page)).toBeVisible();
      await page.waitForTimeout(300);
      expect(await seriousViolations(page), title).toEqual([]);
      await page.keyboard.press('Escape');
      await expect(panel(page)).toHaveCount(0);
    }
  });
}

test('virtual list keeps the active option in view and announces its position', async ({ page }) => {
  const trigger = example(page, 'Virtual scroll').getByRole('combobox');
  await trigger.click();
  const search = page.locator('.tx-select__panel').getByRole('searchbox');
  await expect(search).toBeFocused();
  expect(await page.locator('.tx-select__option').count()).toBeLessThan(60);
  await search.press('ArrowUp');
  const active = page.locator('.tx-select__option--active');
  await expect(active).toHaveText('Invoice #10000');
  await expect(active).toBeInViewport();
  await expect(active).toHaveAttribute('aria-setsize', '10000');
  await expect(active).toHaveAttribute('aria-posinset', '10000');
  await expect(search).toHaveAttribute('aria-activedescendant', (await active.getAttribute('id')) ?? '');
  await page.keyboard.press('Enter');
  await expect(trigger).toContainText('Invoice #10000');
});

test('groups are skipped by the keys and disabled options cannot be picked', async ({ page }) => {
  const groups = example(page, 'Groups').getByRole('combobox');
  await groups.click();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await expect(groups).toContainText('Singapore (UTC+8)');

  const plans = example(page, 'Disabled options').getByRole('combobox');
  await plans.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.tx-select__option--active')).toHaveText('Business');
  await page.getByRole('option', { name: /no seats left/ }).click({ force: true });
  await expect(panel(page)).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(plans).toContainText('Business');
});

test('clear empties the value without opening the panel and keeps the field size', async ({ page }) => {
  const frame = example(page, 'Clear');
  const box = frame.locator('.tx-select__box');
  const height = (await box.boundingBox())?.height;
  await frame.getByRole('button', { name: 'Clear' }).click();
  await expect(frame.getByRole('combobox')).toContainText('Any status');
  await expect(frame.getByText('Last change: cleared')).toBeVisible();
  await expect(panel(page)).toHaveCount(0);
  await expect(frame.getByRole('button', { name: 'Clear' })).toHaveCount(0);
  expect((await box.boundingBox())?.height).toBe(height);
});

test('editable select takes free text and options', async ({ page }) => {
  const frame = example(page, 'Editable');
  const input = frame.getByRole('combobox');
  await input.fill('Boxes');
  await expect(frame.getByText('Value: Boxes')).toBeVisible();
  await input.fill('');
  await input.pressSequentially('Kilo');
  await expect(page.locator('.tx-select__option--active')).toHaveText('Kilograms');
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('Kilograms');
  await expect(frame.getByText('Value: kg')).toBeVisible();
});

test('lazy list loads the rows that scroll into view and searches on the server', async ({ page }) => {
  const trigger = example(page, 'Lazy').getByRole('combobox');
  await trigger.click();
  await expect(page.locator('.tx-select__option[role="option"]').first()).toHaveText('Customer 1');
  await page.locator('cdk-virtual-scroll-viewport').evaluate((viewport) => viewport.scrollTo(0, 36 * 1200));
  await expect(page.getByRole('option', { name: 'Customer 1205', exact: true })).toBeVisible();
  await page.locator('.tx-select__panel').getByRole('searchbox').fill('1999');
  await expect(page.locator('.tx-select__option[role="option"]')).toHaveText(['Customer 1999']);
});

test('create option is reachable from the search with Tab', async ({ page }) => {
  const trigger = example(page, 'Create option').getByRole('combobox');
  await trigger.click();
  const search = page.locator('.tx-select__panel').getByRole('searchbox');
  await expect(search).toBeFocused();
  await search.fill('Design');
  await page.keyboard.press('Tab');
  const create = page.getByRole('button', { name: /Create “Design”/ });
  await expect(create).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(search).toBeFocused();
  await expect(page.locator('.tx-select__option--selected')).toHaveText('Design');
  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);
  await expect(trigger).toContainText('Design');
  await expect(trigger).toBeFocused();
});

test('options and checkboxes change colour smoothly on hover', async ({ page }) => {
  await example(page, 'Basic').getByRole('combobox').click();
  const option = page.getByRole('option').first();
  expect(parseFloat(await option.evaluate((element) => getComputedStyle(element).transitionDuration))).toBeGreaterThan(0);
});
