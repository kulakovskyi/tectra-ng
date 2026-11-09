import { Locator } from '@playwright/test';
import { expect, test } from './fixtures';

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('actions menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/actions-menu');
    await page.locator('main h1').first().waitFor();
  });

  test('opens on the keyboard, moves with the arrows and returns the focus after a choice', async ({ page }) => {
    const root = page.locator('actions-menu-basic-example');
    const trigger = root.getByRole('button', { name: 'Team actions' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menuitem', { name: 'Rename team' })).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('menuitem', { name: 'Delete team' })).toBeFocused();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(root.locator('.result')).toHaveText('Last action: Move to another unit');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('the list sits under its button with a single inner padding', async ({ page }) => {
    const trigger = page.locator('actions-menu-basic-example').getByRole('button', { name: 'Team actions' });
    await trigger.click();
    const list = page.locator('.tx-actions-menu__list');
    const item = page.getByRole('menuitem', { name: 'Rename team' });
    const [listBox, itemBox, triggerBox] = [await box(list), await box(item), await box(trigger)];
    expect(itemBox.x - listBox.x).toBeCloseTo(5.25, 0);
    expect(itemBox.y - listBox.y).toBeCloseTo(5.25, 0);
    expect(listBox.y).toBeGreaterThan(triggerBox.y + triggerBox.height);
    expect(listBox.width).toBeGreaterThanOrEqual(168);
  });

  test('a destructive action opens a confirm after the menu has closed', async ({ page }) => {
    const root = page.locator('actions-menu-confirm-example');
    await root.getByRole('button', { name: 'Nightly backup actions' }).click();
    await page.getByRole('menuitem', { name: 'Delete job' }).click();
    const dialog = page.getByRole('alertdialog').or(page.getByRole('dialog')).filter({ hasText: 'Delete “Nightly backup”?' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await expect(root.getByText('Nightly backup')).toHaveCount(0);
  });
});

test.describe('action tile', () => {
  test('shows a spinner while loading and blocks the other tiles', async ({ page }) => {
    await page.goto('/components/action-tile');
    const tiles = page.locator('action-tile-basic-example tx-action-tile button');
    await expect(page.getByRole('button', { name: 'Email a code We send a one-time code to j***@mail.com' })).toBeVisible();
    await tiles.nth(0).click();
    await expect(tiles.nth(0)).toHaveAttribute('aria-busy', 'true');
    await expect(tiles.nth(1)).toBeDisabled();
    await expect(tiles.nth(0).locator('[data-icon="spinner"]')).toBeVisible();
    await expect(tiles.nth(1)).toBeEnabled({ timeout: 4000 });
    await expect(tiles.nth(0)).not.toHaveAttribute('aria-busy');
    const region = page.locator('.cdk-live-announcer-element');
    await expect(region).toContainText('Email a code: done');
    expect((await box(region)).width).toBeLessThanOrEqual(1);
  });
});
