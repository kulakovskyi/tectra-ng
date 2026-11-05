import { expect, test } from '@playwright/test';

test('email hint completes the domain, fixes a typo and fills the field', async ({ page }) => {
  await page.goto('/components/email-suggestion');
  const frame = page.locator('email-suggestion-basic-example');
  const input = frame.getByRole('textbox', { name: 'Work email' });
  await input.fill('olena');
  await frame.getByRole('button', { name: 'Use olena@example.com' }).click();
  await expect(input).toHaveValue('olena@example.com');
  await expect(frame.getByRole('status')).toHaveText('');
  await input.fill('olena@gmial.com');
  await expect(frame.getByRole('status')).toHaveText('Did you mean olena@gmail.com?');
});
