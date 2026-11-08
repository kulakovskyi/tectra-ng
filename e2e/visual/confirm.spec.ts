import { expect, test } from './fixtures';

test('confirm dialog starts on the safe button, confirms from the keyboard and gives focus back', async ({ page }) => {
  await page.goto('/components/confirm');
  const files = page.locator('confirm-delete-example');
  const deleteLogo = files.getByRole('button', { name: 'Delete Logo.svg' });
  await deleteLogo.click();
  const dialog = page.getByRole('alertdialog', { name: 'Delete “Logo.svg”?' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription('The file and its version history will be gone for everyone.');
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(deleteLogo).toBeFocused();
  await expect(files.getByText('Logo.svg')).toBeVisible();

  await deleteLogo.click();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Delete' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog).toHaveCount(0);
  await expect(files.getByText('Logo.svg')).toHaveCount(0);
});

test('confirm popup asks next to its button', async ({ page }) => {
  await page.goto('/components/confirm');
  const members = page.locator('confirm-popup-example');
  const remove = members.getByRole('button', { name: 'Remove Marek Nowak' });
  await remove.click();
  const popup = page.getByRole('alertdialog');
  await expect(popup).toHaveAccessibleDescription('Remove Marek Nowak from the team?');
  const [origin, panel] = await Promise.all([remove, popup].map((locator) => locator.evaluate((element) => element.getBoundingClientRect().toJSON())));
  expect(panel.right).toBeLessThanOrEqual(origin.left);
  await popup.getByRole('button', { name: 'Remove' }).click();
  await expect(popup).toHaveCount(0);
  await expect(members.getByText('Marek Nowak')).toHaveCount(0);
});

test('confirm waits for an async accept', async ({ page }) => {
  await page.clock.install();
  await page.goto('/components/confirm');
  await page.locator('confirm-async-example').getByRole('button', { name: 'Revoke key' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Revoke this key?' });
  await dialog.getByRole('button', { name: 'Revoke' }).click();
  await expect(dialog.getByRole('button', { name: 'Revoke' })).toHaveAttribute('aria-busy', 'true');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await page.clock.fastForward(1600);
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('confirm-async-example').getByRole('button', { name: 'Revoked' })).toBeDisabled();
});
