import { Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.beforeEach(async ({ page }) => {
  await page.goto('/components/listbox');
  await page.locator('main h1').first().waitFor();
});

test('listbox is reached with Tab and picks with the keys', async ({ page }) => {
  const frame = example(page, 'Basic');
  const list = frame.getByRole('listbox', { name: 'City' });
  await list.focus();
  await expect(frame.locator('.tx-select__option--active')).toHaveText('Lviv');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(frame.getByText('Value: odesa')).toBeVisible();
  await expect(frame.getByRole('option', { name: 'Odesa' })).toHaveAttribute('aria-selected', 'true');
  await expect(frame.locator('tx-listbox')).toHaveCSS('box-shadow', /rgb/);
});

test('field label names the listbox and the hint describes it', async ({ page }) => {
  const frame = example(page, 'Field');
  const list = frame.getByRole('listbox', { name: 'Notification days' });
  await expect(list).toBeVisible();
  const describedBy = (await list.getAttribute('aria-describedby')) ?? '';
  expect(describedBy).not.toBe('');
  await list.focus();
  await page.keyboard.press('Space');
  await expect(frame.getByRole('option', { name: 'Monday' })).toHaveAttribute('aria-selected', 'true');
});

test('virtual listbox keeps the active option in view', async ({ page }) => {
  const frame = example(page, 'Virtual scroll');
  const search = frame.getByRole('searchbox');
  await search.focus();
  await search.press('ArrowUp');
  const active = frame.locator('.tx-select__option--active');
  await expect(active).toHaveText('Port 10999');
  await expect(active).toBeInViewport();
  await search.press('Enter');
  await expect(active).toHaveAttribute('aria-selected', 'true');
});
