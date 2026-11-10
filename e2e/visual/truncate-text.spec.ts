import { expect, test } from './fixtures';

test('truncate text shows the full value in a tooltip, by hover and by keyboard', async ({ page }) => {
  await page.goto('/components/truncate-text');
  const example = page.locator('truncate-text-basic-example');
  const cut = example.locator('tx-truncate-text').first().locator('.tx-truncate-text__text');
  await expect(cut.locator('[aria-hidden="true"]')).toHaveText('Quarterly marketing repo...');
  await cut.hover();
  await expect(page.locator('tx-tooltip')).toHaveText('Quarterly marketing report for the spring campaign');
  const [origin, tip] = await Promise.all([cut, page.locator('tx-tooltip')].map((locator) => locator.evaluate((element) => element.getBoundingClientRect().toJSON())));
  expect(tip.bottom).toBeLessThanOrEqual(origin.top);
  await page.mouse.move(0, 0);
  await expect(page.locator('tx-tooltip')).toHaveCount(0);
  await cut.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(page.locator('tx-tooltip')).toHaveText('Quarterly marketing report for the spring campaign');
  await expect(example.locator('tx-truncate-text').nth(1).locator('.tx-truncate-text__text')).not.toHaveAttribute('tabindex');
});

test('truncate text copies the full value and links to it', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/components/truncate-text');
  const copy = page.locator('truncate-text-copy-example');
  await copy.getByRole('button', { name: 'Copy' }).click();
  await expect(copy.locator('.result')).toHaveText('Copied: sk_test_51Hc8f2LkA9xQm3Vt7Rz0pWnYbEuJd');
  await expect(copy.getByRole('button', { name: 'Copied' })).toBeVisible();
  const link = page.locator('truncate-text-link-example').getByRole('link', { name: 'https://example.com/blog/how-we-rebuilt-our-onboarding-in-two-weeks' });
  await expect(link).toHaveAttribute('href', 'https://example.com/blog/how-we-rebuilt-our-onboarding-in-two-weeks');
  await expect(link).toHaveAttribute('target', '_blank');
});
