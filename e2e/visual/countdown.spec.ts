import { Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.describe('countdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date(2026, 10, 6, 12, 0, 0) });
    await page.goto('/components/countdown');
    await page.locator('main h1').first().waitFor();
  });

  test('counts down, completes once and starts again', async ({ page }) => {
    const frame = example(page, 'Basic');
    await expect(frame.getByRole('timer')).toHaveText('5 s');
    await page.clock.runFor(2100);
    await expect(frame.getByRole('timer')).toHaveText('3 s');
    await page.clock.runFor(3100);
    await expect(
      page
        .locator('countdown-basic-example')
        .getByText('Done — this is where the redirect happens.'),
    ).toBeVisible();
    await frame.getByRole('button', { name: 'Start again' }).click();
    await expect(frame.getByRole('timer')).toHaveText('5 s');
  });

  test('turns to the ending colour near zero and applies at zero', async ({ page }) => {
    const frame = example(page, 'Ending soon');
    const timer = frame.getByRole('timer');
    await expect(timer).not.toHaveClass(/tx-countdown--ending/);
    await page.clock.runFor(15100);
    await expect(timer).toHaveText('5 s');
    await expect(timer).toHaveClass(/tx-countdown--ending/);
    const ending = await timer.evaluate((element) => getComputedStyle(element).color);
    const normal = await page
      .locator('countdown-basic-example')
      .evaluate((element) => getComputedStyle(element).color);
    expect(ending).not.toBe(normal);
    await page.clock.runFor(5100);
    await expect(page.locator('countdown-ending-soon-example').getByText('Applied.')).toBeVisible();
  });

  test('keeps the time while paused', async ({ page }) => {
    const frame = example(page, 'Pause');
    await page.clock.runFor(5100);
    await expect(frame.getByRole('timer')).toHaveText('02:55');
    await frame.getByRole('button', { name: 'Pause' }).click();
    await page.clock.runFor(30000);
    await expect(frame.getByRole('timer')).toHaveText('02:55');
    await frame.getByRole('button', { name: 'Resume' }).click();
    await page.clock.runFor(2100);
    await expect(frame.getByRole('timer')).toHaveText('02:53');
  });

  test('counts to a date as a clock', async ({ page }) => {
    await expect(example(page, 'Target').getByRole('timer')).toHaveText('12:00:00');
    await page.clock.runFor(61000);
    await expect(example(page, 'Target').getByRole('timer')).toHaveText('11:58:59');
  });
});
