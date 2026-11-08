import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test('mention suggestions open at the caret and insert from the keyboard', async ({ page }) => {
  await page.goto('/components/mention-textarea');
  await page.locator('main h1').first().waitFor();
  const frame = example(page, 'Basic');
  const textarea = frame.getByRole('textbox', { name: 'Comment' });
  await textarea.pressSequentially('Thanks @ol');
  const panel = page.locator('.tx-mention-textarea__panel');
  await expect(panel.getByRole('option')).toHaveCount(2);
  const caret = await frame.locator('.tx-mention-textarea__caret').boundingBox();
  const panelBox = await panel.boundingBox();
  expect(Math.abs((panelBox?.x ?? 0) - (caret?.x ?? 0))).toBeLessThan(2);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(textarea).toHaveValue('Thanks @Oleh Marchenko ');
  await expect(textarea).toBeFocused();
  await expect(frame.getByText('Mentioned: oleh')).toBeVisible();
});
