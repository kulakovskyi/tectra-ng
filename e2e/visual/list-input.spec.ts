import { expect, test } from './fixtures';

test('list input counts what was pasted, cleans it up and clears it', async ({ page }) => {
  await page.goto('/components/list-input');
  const example = page.locator('list-input-basic-example');
  const field = example.getByRole('textbox', { name: 'Domains' });
  await field.fill('https://Shop.example.com/cart?id=1 news.example.org\nshop.example.com bad_value');
  await expect(example.locator('.tx-list-input__footer tx-pill')).toHaveText(['2 domains', '1 duplicate', '1 not recognized']);
  await expect(example.locator('.tx-list-input__invalid tx-pill')).toHaveText(['bad_value']);
  await expect(example.locator('.result')).toHaveText('Will check: shop.example.com, news.example.org');

  const box = await example.locator('tx-list-input').evaluate((element) => element.getBoundingClientRect().toJSON());
  await example.getByRole('button', { name: 'Clean up' }).click();
  await expect(field).toHaveValue('shop.example.com\nnews.example.org');
  await expect(field).toBeFocused();
  await expect(example.getByRole('button', { name: 'Clean up' })).toHaveCount(0);
  await expect(example.locator('.tx-list-input__invalid')).toHaveCount(0);
  const after = await example.locator('tx-list-input').evaluate((element) => element.getBoundingClientRect().toJSON());
  expect(after.width).toBe(box.width);

  await example.getByRole('button', { name: 'Clear' }).click();
  await expect(field).toHaveValue('');
  await expect(example.locator('.tx-list-input__hint')).toContainText('Paste domains or URLs');
  await expect(example.locator('.result')).toHaveText('Will check: —');
});

test('list input gives a form the parsed array and shows its errors', async ({ page }) => {
  await page.goto('/components/list-input');
  const example = page.locator('list-input-forms-example');
  const field = example.getByRole('textbox', { name: 'Invite by email' });
  await example.getByRole('button', { name: 'Send invitations' }).click();
  await expect(example.locator('.result')).toHaveText('Add at least one email');
  await expect(example.locator('tx-list-input')).toHaveClass(/tx-list-input--invalid/);
  await field.fill('Olena@Example.com, taras@example.com olena@example.com');
  await example.getByRole('button', { name: 'Send invitations' }).click();
  await expect(example.locator('.result')).toHaveText('Sent to 2 people');
  await example.getByRole('button', { name: 'Add the team' }).click();
  await expect(field).toHaveValue('olena@example.com\ntaras@example.com\niryna@example.com');
});
