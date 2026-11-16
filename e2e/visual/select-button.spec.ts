import { expect, test } from './fixtures';

test('select button: arrows move and pick in single mode, toggle buttons in multiple mode', async ({ page }) => {
  await page.goto('/components/select-button');
  const basic = page.locator('select-button-basic-example');
  await basic.getByRole('radio', { name: 'Yearly' }).click();
  await expect(basic.getByText('Value: year')).toBeVisible();
  await basic.getByRole('radio', { name: 'Yearly' }).press('ArrowLeft');
  await expect(basic.getByRole('radio', { name: 'Quarterly' })).toBeFocused();
  await expect(basic.getByText('Value: quarter')).toBeVisible();
  await page.keyboard.press('End');
  await expect(basic.getByText('Value: year')).toBeVisible();
  await page.keyboard.press('Space');
  await expect(basic.getByText('Value: none')).toBeVisible();

  const states = page.locator('select-button-states-example').locator('tx-select-button').first();
  await states.getByRole('radio', { name: 'Courier' }).click();
  await page.keyboard.press('ArrowRight');
  await expect(states.getByRole('radio', { name: 'Post' })).toBeFocused();
  await expect(states.getByRole('radio', { name: 'Post' })).toHaveAttribute('aria-checked', 'true');

  const multiple = page.locator('select-button-multiple-example');
  await multiple.getByRole('button', { name: 'Fri' }).click();
  await page.keyboard.press('ArrowRight');
  await expect(multiple.getByRole('button', { name: 'Sat' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(multiple.getByText('Value: Mon,Tue,Wed,Fri,Sat')).toBeVisible();
});

test('select button: named by its field, invalid until picked, fluid items share the width', async ({ page }) => {
  await page.goto('/components/select-button');
  const form = page.locator('select-button-form-example');
  await form.getByRole('button', { name: 'Continue' }).click();
  await expect(form.getByRole('radiogroup', { name: /Seat class/ })).toHaveAttribute('aria-invalid', 'true');
  await form.getByRole('radio', { name: 'Premium' }).click();
  await expect(form.getByText('Value: premium · valid')).toBeVisible();

  const widths = await page
    .locator('select-button-fluid-example .tx-select-button__item')
    .evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().width)));
  expect(new Set(widths).size).toBe(1);
});
