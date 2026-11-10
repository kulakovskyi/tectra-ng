import { expect, test } from './fixtures';

test('mascot switches its state and follows the assistant', async ({ page }) => {
  await page.goto('/components/mascot');
  const tricks = page.locator('mascot-tricks-example');
  const mascot = tricks.getByRole('img', { name: 'Mascot' });
  await expect(mascot).toHaveAttribute('data-state', 'waving');
  await tricks.getByRole('button', { name: 'dancing', exact: true }).click();
  await expect(mascot).toHaveAttribute('data-state', 'dancing');
  await expect(tricks.getByRole('button', { name: 'dancing', exact: true })).toHaveAttribute('aria-pressed', 'true');

  const assistant = page.locator('mascot-assistant-example');
  await assistant.getByRole('button', { name: 'Summarize the report' }).click();
  await expect(assistant.getByRole('img', { name: 'Assistant' })).toHaveAttribute('data-state', 'thinking');
  await expect(assistant.getByRole('img', { name: 'Assistant' })).toHaveAttribute('data-state', 'happy', { timeout: 4000 });
  await expect(assistant.locator('.message')).toContainText('Revenue grew 12%');
});

test('mascot keeps its pixels sharp and its 15 : 12 shape at every size', async ({ page }) => {
  await page.goto('/components/mascot');
  const sizes = await page.locator('mascot-sizes-example tx-mascot').evaluateAll((items) => items.map((item) => item.getBoundingClientRect().toJSON()));
  const rem = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  expect(sizes.map((box) => Math.round(box.width))).toEqual([24, 48, 96, Math.round(9 * rem)]);
  for (const box of sizes) {
    expect(Math.abs(box.height - (box.width * 12) / 15)).toBeLessThan(1);
  }
});
