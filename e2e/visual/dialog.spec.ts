import { expect, test } from '@playwright/test';
import { trackPage } from './helpers';

test('dialog traps focus, closes with Escape and returns its result', async ({ page }) => {
  await page.goto('/components/dialog');
  const example = page.locator('dialog-service-example');
  const rename = example.getByRole('button', { name: 'Rename' });
  await rename.click();
  const dialog = page.getByRole('dialog', { name: 'Rename project' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  const field = dialog.getByRole('textbox', { name: 'Project name' });
  await expect(field).toBeFocused();
  for (let step = 0; step < 4; step++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(rename).toBeFocused();

  await rename.click();
  await field.fill('Borealis');
  await dialog.getByRole('button', { name: 'Rename' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(example).toContainText('Project: Borealis');
});

test('dialog closes on the mask, keeps the page still and does not shift it', async ({ page }) => {
  const report = await trackPage(page);
  await page.goto('/components/dialog');
  const trigger = page.locator('dialog-scrolling-example').getByRole('button', { name: 'Terms of service' });
  await trigger.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => ({ scroll: window.scrollY, width: document.documentElement.clientWidth }));
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Terms of service' });
  await expect(dialog).toBeVisible();
  const content = dialog.locator('tx-dialog-content');
  expect(await content.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  const during = await page.evaluate(() => ({ width: document.documentElement.clientWidth }));
  expect(during.width).toBe(before.width);
  await page.mouse.click(10, 300);
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(before.scroll);
  expect((await report()).layoutShift).toBeLessThan(0.02);
});

test('dialog guard asks in a second dialog before discarding', async ({ page }) => {
  await page.goto('/components/dialog');
  await page.locator('dialog-guard-example').getByRole('button', { name: 'Write a note' }).click();
  const editor = page.getByRole('dialog', { name: 'New note' });
  await editor.getByRole('textbox', { name: 'Note' }).fill('Call the supplier');
  await page.keyboard.press('Escape');
  const discard = page.getByRole('alertdialog', { name: 'Discard changes?' });
  await expect(discard).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(discard).toHaveCount(0);
  await expect(editor).toBeVisible();
  await editor.getByRole('button', { name: 'Cancel' }).click();
  await discard.getByRole('button', { name: 'Discard' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
});

test('dialog moves by its header and maximizes to the viewport', async ({ page }) => {
  await page.goto('/components/dialog');
  await page.locator('dialog-maximizable-example').getByRole('button', { name: 'Open report' }).click();
  const dialog = page.getByRole('dialog', { name: 'Monthly report' });
  await expect(dialog).toBeVisible();
  const start = await dialog.boundingBox();
  const title = dialog.getByRole('heading', { name: 'Monthly report' });
  const handle = await title.boundingBox();
  await page.mouse.move((handle?.x ?? 0) + 10, (handle?.y ?? 0) + 5);
  await page.mouse.down();
  await page.mouse.move((handle?.x ?? 0) + 110, (handle?.y ?? 0) + 65, { steps: 5 });
  await page.mouse.up();
  const moved = await dialog.boundingBox();
  expect(Math.round((moved?.x ?? 0) - (start?.x ?? 0))).toBe(100);
  expect(Math.round((moved?.y ?? 0) - (start?.y ?? 0))).toBe(60);
  await dialog.getByRole('button', { name: 'Maximize' }).click();
  const viewport = page.viewportSize();
  await expect.poll(async () => Math.round((await dialog.boundingBox())?.width ?? 0)).toBe(viewport?.width);
  await expect(dialog.getByRole('button', { name: 'Restore' })).toBeVisible();
});
