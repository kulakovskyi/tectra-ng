import { expect, test } from './fixtures';

test.describe('network status', () => {
  test('follows the browser going offline and back, then hides', async ({ page, context }) => {
    await page.goto('/components/network-status');
    const pill = page.locator('network-status-basic-example .tx-network-status__pill');
    await expect(pill).toHaveCount(0);
    await context.setOffline(true);
    await expect(pill).toHaveText('No internet connection');
    await expect(pill).toHaveAttribute('data-status', 'offline');
    await context.setOffline(false);
    await expect(pill).toHaveText('Connection restored');
    await expect(pill).toHaveCount(0, { timeout: 5000 });
  });

  test('sits centred at the bottom of its window', async ({ page }) => {
    await page.goto('/components/network-status');
    const root = page.locator('network-status-basic-example');
    await root.getByRole('button', { name: 'Go offline' }).click();
    const pill = root.locator('.tx-network-status__pill');
    await expect(pill).toBeVisible();
    const [frame, box] = [await root.locator('.screen').boundingBox(), await pill.boundingBox()];
    if (!frame || !box) {
      throw new Error('not visible');
    }
    expect(Math.abs(box.x + box.width / 2 - (frame.x + frame.width / 2))).toBeLessThan(2);
    expect(Math.round(frame.y + frame.height - 1 - (box.y + box.height))).toBe(21);
  });
});
