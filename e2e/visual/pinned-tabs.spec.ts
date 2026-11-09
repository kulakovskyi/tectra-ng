import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page) => page.locator('pinned-tabs-basic-example');

test.describe('pinned tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/pinned-tabs');
    await page.locator('main h1').first().waitFor();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('pinned teams become tabs that filter the list and stay after a reload', async ({ page }) => {
    const root = example(page);
    await root.getByRole('button', { name: 'Customize' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('checkbox', { name: 'Sales' }).click();
    await dialog.getByRole('checkbox', { name: 'Design' }).click();
    await expect(dialog.getByText('Selected: 2 of 6')).toBeVisible();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();

    const tabs = root.getByRole('tab');
    await expect(tabs).toHaveText(['All teams', 'Design', 'Sales']);
    await root.getByRole('tab', { name: 'Design' }).click();
    await expect(root.getByRole('tab', { name: 'Design' })).toHaveAttribute('aria-selected', 'true');
    await expect(root.locator('tx-table tbody tr')).toHaveCount(2);

    await page.reload();
    await expect(example(page).getByRole('tab')).toHaveText(['All teams', 'Design', 'Sales']);
  });

  test('the dialog closes without saving on cancel', async ({ page }) => {
    const root = example(page);
    await root.getByRole('button', { name: 'Customize' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('checkbox', { name: 'Growth' }).click();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(root.getByRole('tab')).toHaveCount(0);
    await expect(root.getByRole('button', { name: 'Customize' })).toBeVisible();
  });
});
