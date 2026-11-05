import { expect, test } from '@playwright/test';

test('select basic — light', async ({ page }) => {
  await page.goto('/components/select');
  await expect(page.locator('select-basic-example')).toHaveScreenshot('select-basic-light.png');
});
