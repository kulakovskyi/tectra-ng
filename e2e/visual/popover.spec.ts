import { expect, test } from '@playwright/test';

test('popover moves focus in, closes with Escape and gives focus back', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.locator('popover-basic-example').getByRole('button', { name: 'Share' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Share this report' });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog.getByRole('textbox', { name: 'Report link' })).toBeFocused();
  const [origin, panel] = await Promise.all([trigger, dialog].map((locator) => locator.evaluate((element) => element.getBoundingClientRect().toJSON())));
  expect(panel.top).toBeGreaterThanOrEqual(origin.bottom);
  expect(Math.abs(panel.left - origin.left)).toBeLessThan(1);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('popover closes on an outside click and when Tab leaves it', async ({ page }) => {
  await page.goto('/components/popover');
  const example = page.locator('popover-basic-example');
  const trigger = example.getByRole('button', { name: 'Share' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Share this report' });
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 300);
  await expect(dialog).toHaveCount(0);

  await trigger.click();
  await expect(dialog.getByRole('textbox')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Copy' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).not.toBeFocused();
  expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
});

test('popover follows the clicked element and a nested one keeps its parent open', async ({ page }) => {
  await page.goto('/components/popover');
  const files = page.locator('popover-target-example');
  await files.getByRole('button', { name: 'Details of Q3 report.pdf' }).click();
  const details = page.getByRole('dialog', { name: 'Q3 report.pdf' });
  await expect(details).toContainText('2.4 MB');
  await files.getByRole('button', { name: 'Details of Logo.svg' }).click();
  await expect(page.getByRole('dialog', { name: 'Logo.svg' })).toContainText('Sara Lind');
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.keyboard.press('Escape');

  const nested = page.locator('popover-nested-example');
  await nested.getByRole('button', { name: 'Filters' }).click();
  const filters = page.getByRole('dialog', { name: 'Filters' });
  await filters.getByRole('button', { name: 'Last 30 days' }).click();
  const period = page.getByRole('dialog', { name: 'Period' });
  await period.getByRole('button', { name: 'This quarter' }).click();
  await expect(period).toHaveCount(0);
  await expect(filters).toBeVisible();
  await expect(filters.getByRole('button', { name: 'This quarter' })).toBeVisible();
  await filters.getByRole('button', { name: 'This quarter' }).click();
  await expect(page.getByRole('dialog', { name: 'Period' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Period' })).toHaveCount(0);
  await expect(filters).toBeVisible();
});
