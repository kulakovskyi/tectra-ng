import { expect, test } from '@playwright/test';
import { trackPage } from './helpers';

test('toast shows in the corner, is announced and closes after its life', async ({ page }) => {
  await page.clock.install();
  await page.goto('/components/toast');
  const region = page.getByRole('region', { name: 'Notifications' }).last();
  await page.locator('toast-basic-example').getByRole('button', { name: 'Success' }).click();
  const toast = page.locator('tx-toast[data-position="bottom-right"] .tx-toast__item');
  await expect(toast).toContainText('Changes saved');
  await expect(page.locator('.cdk-live-announcer-element')).toHaveText('Changes saved');
  const box = await toast.boundingBox();
  const viewport = page.viewportSize();
  expect(Math.round((viewport?.width ?? 0) - (box?.x ?? 0) - (box?.width ?? 0))).toBe(16);
  expect(Math.round((viewport?.height ?? 0) - (box?.y ?? 0) - (box?.height ?? 0))).toBe(16);
  await expect(region).toBeAttached();
  await page.clock.fastForward(5100);
  await expect(toast).toHaveCount(0);
});

test('toast waits while hovered and stacks without moving the page', async ({ page }) => {
  const report = await trackPage(page);
  await page.clock.install();
  await page.goto('/components/toast');
  const show = page.locator('toast-progress-example').getByRole('button', { name: 'Show with progress' });
  await show.click();
  await show.click();
  const toasts = page.locator('tx-toast[data-position="bottom-right"] .tx-toast__item');
  await expect(toasts).toHaveCount(2);
  const [older, newer] = await toasts.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().toJSON()));
  expect(newer.top).toBeGreaterThan(older.bottom);
  await toasts.last().hover();
  await page.clock.fastForward(20000);
  await expect(toasts).toHaveCount(1);
  await page.mouse.move(0, 0);
  await page.clock.fastForward(6100);
  await expect(toasts).toHaveCount(0);
  expect((await report()).layoutShift).toBeLessThan(0.02);
});

test('toast action undoes the change and a loading toast turns into a result', async ({ page }) => {
  await page.clock.install();
  await page.goto('/components/toast');
  const list = page.locator('toast-actions-example');
  await list.getByRole('button', { name: 'Archive Budget draft' }).click();
  await expect(list.getByText('Budget draft')).toHaveCount(0);
  await page.getByRole('region', { name: 'Notifications' }).getByRole('button', { name: 'Undo' }).click();
  await expect(list.locator('li').nth(1)).toContainText('Budget draft');

  await page.locator('toast-loading-example').getByRole('button', { name: 'Export rows' }).click();
  const toast = page.locator('tx-toast[data-position="bottom-right"] .tx-toast__item');
  await expect(toast).toHaveAttribute('aria-busy', 'true');
  await page.clock.fastForward(2100);
  await expect(toast).toContainText('Export is ready');
  await expect(toast).toHaveAttribute('data-severity', 'success');
  await expect(toast.getByRole('button', { name: 'Close' })).toBeVisible();
});
