import { expect, test } from '@playwright/test';

test('tooltip shows above its button with the arrow on the middle and hides on leave', async ({ page }) => {
  await page.goto('/components/tooltip');
  const button = page.locator('tooltip-basic-example').getByRole('button', { name: 'Send invoice' });
  await expect(button).toHaveAccessibleDescription('Sends the invoice to the customer');
  await button.hover();
  const tooltip = page.locator('tx-tooltip');
  await expect(tooltip).toHaveText('Sends the invoice to the customer');
  await expect(tooltip).toHaveAttribute('data-placement', 'top');
  const [origin, panel, arrow] = await Promise.all(
    [button, tooltip, tooltip.locator('.tx-tooltip__arrow')].map((locator) => locator.evaluate((element) => element.getBoundingClientRect().toJSON())),
  );
  expect(panel.y + panel.height).toBeLessThanOrEqual(origin.y);
  expect(Math.abs(arrow.x + arrow.width / 2 - (origin.x + origin.width / 2))).toBeLessThan(1.5);
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCount(0);
});

test('tooltip names icon buttons, follows keyboard focus and hides with Escape', async ({ page }) => {
  await page.goto('/components/tooltip');
  const example = page.locator('tooltip-icon-buttons-example');
  const edit = example.getByRole('button', { name: 'Edit', exact: true });
  await expect(edit).toBeVisible();
  await edit.focus();
  const tooltip = page.locator('tx-tooltip');
  await expect(tooltip).toHaveText('Edit');
  await page.keyboard.press('Tab');
  await expect(example.getByRole('button', { name: 'Duplicate' })).toBeFocused();
  await expect(tooltip).toHaveText('Duplicate');
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await expect(example.getByRole('button', { name: 'Duplicate' })).toBeFocused();
});

test('tooltip stays open while the pointer moves onto it', async ({ page }) => {
  await page.goto('/components/tooltip');
  const id = page.locator('tooltip-interactive-example').getByRole('button', { name: 'ord_8F2KQ1…' });
  await id.hover();
  const tooltip = page.locator('tx-tooltip');
  await expect(tooltip).toBeVisible();
  const box = await tooltip.boundingBox();
  await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2, { steps: 4 });
  await page.waitForTimeout(300);
  await expect(tooltip).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCount(0);
});

test('tooltip flips below when there is no room above', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 520 });
  await page.goto('/components/tooltip');
  const origin = page.locator('tooltip-placements-example').getByRole('button', { name: 'top', exact: true });
  await expect(origin).toBeVisible();
  const scrollBelow = (top: number) => origin.evaluate((element, offset) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - offset), top);
  await scrollBelow(200);
  const stuckBottom = await page.locator('.tabs-bar').evaluate((bar) => bar.getBoundingClientRect().bottom);
  await scrollBelow(stuckBottom + 12);
  await origin.hover();
  await expect(page.locator('tx-tooltip')).toHaveAttribute('data-placement', 'bottom');
});

test('tooltip shows only for cut-off text', async ({ page }) => {
  await page.goto('/components/tooltip');
  const example = page.locator('tooltip-overflow-example');
  await example.getByRole('link', { name: 'Pricing' }).hover();
  await page.waitForTimeout(400);
  await expect(page.locator('tx-tooltip')).toHaveCount(0);
  await example.getByRole('link', { name: /running shoe/ }).hover();
  await expect(page.locator('tx-tooltip')).toContainText('trails and roads');
});
