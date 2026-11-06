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
  await expect(trigger.locator('img.tx-country__flag')).toHaveAttribute('src', /^data:image\/svg\+xml,/);
  const ringRoom = await trigger.locator('img.tx-country__flag').evaluate((flag) => {
    const clip = flag.closest('.tx-select__value') as Element;
    return flag.getBoundingClientRect().left - clip.getBoundingClientRect().left;
  });
  expect(ringRoom).toBeGreaterThanOrEqual(1);
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

test('flags load one by one as images, rectangle and circle', async ({ page }) => {
  await page.goto('/components/country');
  const frame = example(page, 'Flag set');
  const flags = frame.locator('img.tx-country__flag');
  await expect(flags).toHaveCount(16);
  for (const flag of await flags.all()) {
    await expect(flag).toHaveJSProperty('complete', true);
    expect(await flag.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  }
  const [rectangle, circle] = await Promise.all([flags.first().boundingBox(), flags.nth(8).boundingBox()]);
  expect(Math.round((rectangle?.width ?? 0) / (rectangle?.height ?? 1) * 3)).toBe(4);
  expect(Math.round(circle?.width ?? 0)).toBe(Math.round(circle?.height ?? 0));
  await expect(example(page, 'Emoji').locator('.tx-country__flag--emoji').first()).toHaveText('🇺🇦');
});
