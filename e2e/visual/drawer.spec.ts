import { expect, test } from './fixtures';
import { layoutViewport } from './helpers';

test('drawer slides in at the right edge, traps focus and gives it back', async ({ page }) => {
  await page.goto('/components/drawer');
  const trigger = page.locator('drawer-basic-example').getByRole('button', { name: 'Filters' });
  await trigger.click();
  const drawer = page.getByRole('dialog', { name: 'Filters' });
  await expect(drawer).toBeVisible();
  const box = await drawer.boundingBox();
  const viewport = await layoutViewport(page);
  expect(Math.round((box?.x ?? 0) + (box?.width ?? 0))).toBe(viewport.width);
  expect(Math.round(box?.height ?? 0)).toBe(viewport.height);
  await expect(drawer.getByRole('checkbox', { name: 'Draft' })).toBeFocused();
  for (let step = 0; step < 8; step++) {
    await page.keyboard.press('Tab');
    expect(await drawer.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await drawer.getByRole('checkbox', { name: 'Draft' }).check();
  await drawer.getByRole('button', { name: 'Apply' }).click();
  await expect(drawer).toHaveCount(0);
  await expect(page.locator('drawer-basic-example')).toContainText('Draft, Published');
});

test('non-modal drawer leaves the page usable', async ({ page }) => {
  await page.goto('/components/drawer');
  const toggle = page.locator('drawer-non-modal-example').getByRole('button');
  await toggle.click();
  const drawer = page.getByRole('dialog', { name: 'Help' });
  await expect(drawer).toBeVisible();
  await expect(drawer).not.toHaveAttribute('aria-modal', 'true');
  await expect(toggle).toHaveText(/Hide help/);
  await toggle.click();
  await expect(drawer).toHaveCount(0);
});
