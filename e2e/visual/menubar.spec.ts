import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, id: string) => page.locator(`menubar-${id}-example`);
const submenus = (page: Page) => page.locator('tx-menu-list[data-panel="submenu"]');

test.describe('menubar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/menubar');
    await page.locator('main h1').first().waitFor();
  });

  test('opens the first level below the root item and deeper levels to the side', async ({ page }) => {
    const file = example(page, 'basic').getByRole('menuitem', { name: 'File' });
    await file.click();
    await expect(file).toHaveAttribute('aria-expanded', 'true');
    const panel = submenus(page).first();
    await expect(panel).toBeVisible();
    const root = await file.boundingBox();
    const first = await panel.boundingBox();
    expect(first?.y ?? 0).toBeGreaterThanOrEqual((root?.y ?? 0) + (root?.height ?? 0));
    expect(Math.abs((first?.x ?? 0) - (root?.x ?? 0))).toBeLessThan(2);
    await page.getByRole('menuitem', { name: 'Export' }).hover();
    const nested = submenus(page).nth(1);
    await expect(nested).toBeVisible();
    const second = await nested.boundingBox();
    expect(second?.x ?? 0).toBeGreaterThan((first?.x ?? 0) + (first?.width ?? 0) - 8);
    await page.getByRole('menuitem', { name: 'PDF' }).click();
    await expect(submenus(page)).toHaveCount(0);
    await expect(example(page, 'basic').getByText('Last command: Export PDF')).toBeVisible();
  });

  test('switches submenus on hover once one is open', async ({ page }) => {
    const bar = example(page, 'basic');
    await bar.getByRole('menuitem', { name: 'Edit' }).click();
    await bar.getByRole('menuitem', { name: 'Help' }).hover();
    await expect(bar.getByRole('menuitem', { name: 'Help' })).toHaveAttribute('aria-expanded', 'true');
    await expect(bar.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute('aria-expanded', 'false');
    await page.mouse.click(5, 5);
    await expect(submenus(page)).toHaveCount(0);
  });

  test('moves with the arrows, opens with Down and closes with Escape', async ({ page }) => {
    const bar = example(page, 'basic');
    const file = bar.getByRole('menuitem', { name: 'File' });
    const edit = bar.getByRole('menuitem', { name: 'Edit' });
    await file.focus();
    await page.keyboard.press('ArrowRight');
    await expect(edit).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Undo' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menuitem', { name: 'Search' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Undo' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(submenus(page)).toHaveCount(0);
    await expect(edit).toBeFocused();
  });

  test('turns into a button with an inline menu below the breakpoint', async ({ page }) => {
    const bar = example(page, 'mobile');
    const list = bar.getByRole('menubar');
    await expect(list).toBeHidden();
    await bar.getByRole('button', { name: 'Menu' }).click();
    await expect(list).toBeVisible();
    await bar.getByRole('menuitem', { name: 'Billing' }).click();
    await expect(bar.getByRole('menuitem', { name: 'Invoices' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(list).toBeHidden();
    await expect(bar.getByRole('button', { name: 'Menu' })).toBeFocused();
  });
});
