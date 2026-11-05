import { Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test('country select finds by code, shows the flag and the localized name', async ({ page }) => {
  await page.goto('/components/country-select');
  await page.locator('main h1').first().waitFor();
  const frame = example(page, 'Basic');
  const trigger = frame.getByRole('combobox');
  await expect(trigger).toContainText('Ukraine');
  await trigger.click();
  await page.locator('.tx-select__panel').getByRole('searchbox').fill('jp');
  await expect(page.getByRole('option')).toHaveText([/Japan/]);
  await page.keyboard.press('Enter');
  await expect(frame.getByText('Value: JP')).toBeVisible();
  await expect(trigger.locator('.tx-country__flag')).toHaveText('🇯🇵');
});

test('several countries show flags and a counter', async ({ page }) => {
  await page.goto('/components/country-select');
  const frame = example(page, 'Multiple');
  await expect(frame.locator('.tx-country-select__flags tx-country')).toHaveCount(3);
  await expect(frame.locator('.tx-country-select__more')).toHaveText('+2');
});

test('flag-only countries are named images', async ({ page }) => {
  await page.goto('/components/country');
  await expect(example(page, 'Flag only').getByRole('img', { name: 'Sweden' })).toBeVisible();
});
