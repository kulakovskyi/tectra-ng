import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, id: string) => page.locator(`command-palette-${id}-example`);

test.describe('command palette', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/command-palette');
    await page.locator('main h1').first().waitFor();
  });

  test('the shortcut opens the window, the keys move and Enter picks', async ({ page }) => {
    const root = example(page, 'basic');
    await page.keyboard.press('ControlOrMeta+k');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const field = dialog.getByRole('combobox');
    await expect(field).toBeFocused();
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await field.fill('rep');
    await expect(dialog.getByRole('option')).toHaveText([/Reports/]);
    await field.fill('');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(dialog.getByRole('option').nth(2)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(dialog).toHaveCount(0);
    await expect(root.getByText('Opened: All domains')).toBeVisible();
  });

  test('a server search shows the loading row, then the results or nothing found', async ({ page }) => {
    const root = example(page, 'server-search');
    await root.getByRole('button', { name: 'Find a domain' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('combobox').fill('shop');
    await expect(dialog.getByText('Searching…')).toBeVisible();
    await expect(dialog.getByRole('option')).toHaveCount(2);
    await dialog.getByRole('combobox').fill('zzz');
    await expect(dialog.getByText('Nothing found')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });

  test('the page does not scroll behind the open window, a mask click closes it and focus comes back to the button', async ({ page }) => {
    const root = example(page, 'basic');
    await root.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    await page.locator('.tx-command-palette__overlay').click({ position: { x: 5, y: 5 } });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await root.getByRole('button', { name: 'Search' }).click();
    await page.keyboard.press('Escape');
    await expect(root.getByRole('button', { name: 'Search' })).toBeFocused();
  });
});
