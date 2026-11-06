import { Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.describe('panel menu', () => {
  test('opens one panel at a time and nested items in place', async ({ page }) => {
    await page.goto('/components/panel-menu');
    const menu = example(page, 'Basic').locator('tx-panel-menu');
    const files = menu.getByRole('button', { name: 'Files' });
    const cloud = menu.getByRole('button', { name: 'Cloud' });
    await files.click();
    await expect(files).toHaveAttribute('aria-expanded', 'true');
    const documents = menu.getByRole('treeitem', { name: 'Documents' });
    await expect(documents).toBeVisible();
    await documents.click();
    await expect(menu.getByRole('treeitem', { name: 'Invoices' })).toBeVisible();
    await cloud.click();
    await expect(files).toHaveAttribute('aria-expanded', 'false');
    await expect(documents).toBeHidden();
    await expect(menu.getByRole('treeitem', { name: 'Upload' })).toBeVisible();
  });

  test('nests the item corners inside the panel', async ({ page }) => {
    await page.goto('/components/panel-menu');
    const menu = example(page, 'Basic').locator('tx-panel-menu');
    await menu.getByRole('button', { name: 'Files' }).click();
    const panel = await menu.locator('.tx-panel-menu__panel').first().evaluate((element) => {
      const style = getComputedStyle(element);
      return { padding: style.paddingTop, left: style.paddingLeft, radius: style.borderTopLeftRadius };
    });
    expect(panel).toEqual({ padding: '5.25px', left: '5.25px', radius: '10px' });
    const header = await menu.getByRole('button', { name: 'Files' }).boundingBox();
    const first = await menu.getByRole('treeitem', { name: 'Documents' }).boundingBox();
    expect(await menu.getByRole('treeitem', { name: 'Documents' }).evaluate((element) => getComputedStyle(element).borderTopLeftRadius)).toBe('5px');
    expect(Math.round((first?.y ?? 0) - (header?.y ?? 0) - (header?.height ?? 0))).toBe(2);
  });

  test('moves with the keyboard between headers and through the tree', async ({ page }) => {
    await page.goto('/components/panel-menu');
    const menu = example(page, 'Basic').locator('tx-panel-menu');
    const files = menu.getByRole('button', { name: 'Files' });
    await files.focus();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('button', { name: 'Cloud' })).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await expect(files).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    const documents = menu.getByRole('treeitem', { name: 'Documents' });
    await expect(documents).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(documents).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(menu.getByRole('treeitem', { name: 'Invoices' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(documents).toBeFocused();
    await page.keyboard.press('End');
    await expect(menu.getByRole('treeitem', { name: 'Images' })).toBeFocused();
  });

  test('sidebar marks the current route, opens its parents and follows navigation', async ({ page }) => {
    await page.goto('/components/panel-menu?folder=work');
    const sidebar = example(page, 'Router links').locator('tx-panel-menu[data-variant="sidebar"]');
    const work = sidebar.getByRole('treeitem', { name: 'Work' });
    await expect(work).toHaveAttribute('aria-current', 'page');
    await expect(sidebar.getByRole('treeitem', { name: 'Labels' })).toHaveAttribute('aria-expanded', 'true');
    await sidebar.getByRole('treeitem', { name: 'Inbox' }).click();
    await expect(page).toHaveURL(/folder=inbox/);
    await expect(sidebar.getByRole('treeitem', { name: 'Inbox' })).toHaveAttribute('aria-current', 'page');
    await expect(sidebar.getByRole('treeitem', { name: 'Labels' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('sidebar items keep their inset by level', async ({ page }) => {
    await page.goto('/components/panel-menu');
    const sidebar = example(page, 'Sidebar').locator('tx-panel-menu');
    await sidebar.getByRole('treeitem', { name: 'Projects' }).click();
    const inset = async (name: string) =>
      sidebar.getByRole('treeitem', { name, exact: true }).evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.marginLeft, style.paddingLeft, style.paddingTop];
      });
    expect(await inset('Overview')).toEqual(['10.5px', '16.8px', '7.875px']);
    expect(await inset('Website')).toEqual(['10.5px', '25.2px', '7.875px']);
    const badge = sidebar.locator('.tx-panel-menu__badge').first();
    await expect(badge).toHaveText('99+');
    await expect(badge).toHaveCSS('color', 'rgb(255, 255, 255)');
  });
});
