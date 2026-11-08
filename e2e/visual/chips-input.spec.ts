import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.beforeEach(async ({ page }) => {
  await page.goto('/components/chips-input');
  await page.locator('main h1').first().waitFor();
});

test('chips are typed, removed from the keyboard and keep the field height', async ({ page }) => {
  const frame = example(page, 'Basic');
  const input = frame.getByRole('textbox', { name: 'Keywords' });
  const box = frame.locator('.tx-chips-input__box');
  const height = (await box.boundingBox())?.height ?? 0;
  const plain = await page.locator('chips-input-states-example tx-chips-input').nth(1).locator('.tx-chips-input__box').boundingBox();
  expect(Math.abs(height - (plain?.height ?? 0))).toBeLessThan(1);
  await input.fill('signals');
  await input.press('Enter');
  await expect(frame.locator('tx-chip')).toHaveText(['design', 'tokens', 'signals']);
  await frame.getByRole('button', { name: 'Remove tokens' }).focus();
  await page.keyboard.press('Delete');
  await expect(frame.locator('tx-chip')).toHaveText(['design', 'signals']);
  await expect(input).toBeFocused();
  await page.keyboard.press('Backspace');
  await expect(frame.getByText('Value: design')).toBeVisible();
});

test('pasted list becomes chips', async ({ page }) => {
  const frame = example(page, 'Paste');
  const input = frame.getByRole('textbox');
  await input.focus();
  await page.evaluate(() => {
    const data = new DataTransfer();
    data.setData('text', 'one.example.net\ntwo.example.net, three.example.net');
    document.activeElement?.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
  });
  await expect(frame.getByText('5 domains')).toBeVisible();
});
