import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('select page has no a11y violations', async ({ page }) => {
  await page.goto('/components/select');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
