import { expect, test } from '@playwright/test';

test('select panel is opaque and selects with the keyboard', async ({ page }) => {
  await page.goto('/components/select');
  const trigger = page.locator('tx-select .tx-select__trigger').first();
  await trigger.click();
  const panel = page.locator('.tx-select__panel');
  await expect(panel).toBeVisible();
  const background = await panel.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(trigger).toContainText('Lviv');
});

test('example code opens without moving the preview', async ({ page }) => {
  await page.goto('/components/button');
  const example = page.locator('docs-example-frame').first();
  const preview = example.locator('.example__preview');
  const before = await preview.boundingBox();
  await example.getByRole('button', { name: 'Show code' }).click();
  await expect(example.locator('.example__code')).toHaveClass(/example__code--open/);
  await expect(example.locator('pre')).toBeVisible();
  expect(await preview.boundingBox()).toEqual(before);
});

test('navigation keeps the page heading in place', async ({ page }) => {
  await page.goto('/components/button');
  const heading = page.locator('main h1');
  const start = await heading.boundingBox();
  for (const link of ['Select', 'Installation', 'Badge']) {
    await page.getByRole('link', { name: link, exact: true }).first().click();
    await expect(heading).toHaveText(link);
    await page.waitForTimeout(300);
    const box = await heading.boundingBox();
    expect(Math.round(box?.y ?? 0)).toBe(Math.round(start?.y ?? 0));
  }
});

test('icon-only buttons are square', async ({ page }) => {
  await page.goto('/components/button');
  const sizes = await page.locator('.tx-button--icon-only').evaluateAll((buttons) =>
    buttons.map((button) => ({ width: Math.round(button.getBoundingClientRect().width), height: Math.round(button.getBoundingClientRect().height) })),
  );
  expect(sizes.length).toBeGreaterThan(0);
  for (const size of sizes) {
    expect(size.width).toBe(size.height);
  }
});

test('theme toggle switches to dark', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-tx-theme', 'dark');
});
