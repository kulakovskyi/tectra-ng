import { expect, test } from '@playwright/test';
import { trackPage } from './helpers';

const OUTLET = 'tx-toast:not([data-position="top-center"]):not([key])';

test('toast shows as a pill at the bottom centre, is announced and closes after its life', async ({ page }) => {
  await page.clock.install();
  await page.goto('/components/toast');
  await page.locator('toast-basic-example').getByRole('button', { name: 'Success' }).click();
  const outlet = page.locator('body > tx-toast[data-position="bottom-center"]').first();
  const pill = outlet.locator('.tx-toast__pill');
  await expect(pill).toContainText('Changes saved');
  await expect(page.locator('.cdk-live-announcer-element')).toHaveText('Changes saved');
  await page.clock.fastForward(400);
  const box = await pill.boundingBox();
  const size = await page.evaluate(() => ({ width: document.documentElement.clientWidth, height: window.innerHeight }));
  expect(Math.abs((box?.x ?? 0) + (box?.width ?? 0) / 2 - size.width / 2)).toBeLessThan(1);
  expect(Math.round(size.height - (box?.y ?? 0) - (box?.height ?? 0))).toBe(28);
  await page.clock.fastForward(3000);
  await expect(pill).toHaveCount(0);
});

test('toasts stack, spread out while hovered and do not move the page', async ({ page }) => {
  const report = await trackPage(page);
  await page.clock.install();
  await page.goto('/components/toast');
  const show = page.locator('toast-progress-example').getByRole('button', { name: 'Show with progress' });
  await show.click();
  await show.click();
  const outlet = page.locator('body > tx-toast[data-position="bottom-center"]').first();
  const items = outlet.locator('.tx-toast__item');
  await expect(items).toHaveCount(2);
  await page.clock.fastForward(400);
  const [front, back] = await items.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().toJSON()));
  expect(back.bottom).toBeLessThan(front.bottom);
  expect(back.bottom).toBeGreaterThan(front.top);
  await items.first().hover();
  await expect(outlet).toHaveAttribute('data-expanded', '');
  await page.clock.fastForward(400);
  const [spreadFront, spreadBack] = await items.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().toJSON()));
  expect(spreadBack.bottom).toBeLessThanOrEqual(spreadFront.top - 7);
  await page.clock.fastForward(20000);
  await expect(items).toHaveCount(2);
  await page.mouse.move(0, 0);
  await page.clock.fastForward(6100);
  await expect(items).toHaveCount(0);
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
  const pill = page.locator('body > tx-toast[data-position="bottom-center"]').first().locator('.tx-toast__pill').first();
  await expect(pill).toHaveAttribute('aria-busy', 'true');
  await page.clock.fastForward(2100);
  await expect(pill).toContainText('Export is ready');
  await expect(pill).toHaveAttribute('data-severity', 'success');
  await expect(pill.getByRole('button', { name: 'Close' })).toBeAttached();
});

test.describe('outlets', () => {
  test('keyed outlets stay apart', async ({ page }) => {
    await page.goto('/components/toast');
    await page.locator('toast-positions-example').getByRole('button', { name: 'top-left' }).click();
    await expect(page.locator('tx-toast[data-position="top-left"] .tx-toast__pill')).toContainText('Shown at top-left');
    await expect(page.locator(OUTLET).locator('.tx-toast__pill')).toHaveCount(0);
  });
});
