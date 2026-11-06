import { expect, test } from '@playwright/test';

test('split button runs its action and opens its menu under the whole button', async ({ page }) => {
  await page.goto('/components/split-button');
  const example = page.locator('split-button-basic-example');
  await example.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('body > tx-toast')).toContainText('Changes saved');
  const toggle = example.getByRole('button', { name: 'More actions' });
  await toggle.focus();
  await page.keyboard.press('ArrowDown');
  const menu = page.getByRole('menu', { name: 'More actions' });
  await expect(menu.getByRole('menuitem', { name: 'Save as draft' })).toBeFocused();
  const [group, panel] = await Promise.all(
    [example.locator('tx-split-button'), menu].map((locator) => locator.evaluate((element) => element.getBoundingClientRect().toJSON())),
  );
  expect(Math.abs(panel.right - group.right)).toBeLessThan(1);
  expect(panel.top).toBeGreaterThanOrEqual(group.bottom);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(menu).toHaveCount(0);
  await expect(page.locator('body > tx-toast')).toContainText('Template saved');
});

test('speed dial fans out, follows the arrows and runs an action', async ({ page }) => {
  await page.goto('/components/speed-dial');
  const example = page.locator('speed-dial-basic-example');
  const button = example.getByRole('button', { name: 'Create' });
  await button.focus();
  await page.keyboard.press('ArrowUp');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  const note = example.getByRole('menuitem', { name: 'Note' });
  await expect(note).toBeFocused();
  const [origin, first] = await Promise.all([button, note].map((locator) => locator.evaluate((element) => element.getBoundingClientRect().toJSON())));
  expect(first.bottom).toBeLessThanOrEqual(origin.top);
  expect(Math.abs(first.left + first.width / 2 - (origin.left + origin.width / 2))).toBeLessThan(1);
  await page.keyboard.press('ArrowUp');
  await expect(example.getByRole('menuitem', { name: 'Event' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('body > tx-toast')).toContainText('Event created');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toBeFocused();
  await expect(example.getByRole('menuitem', { name: 'Note' })).toBeHidden();
});
