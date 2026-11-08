import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

const angle = (page: Page, title: string, hand: string) =>
  example(page, title)
    .locator(`.tx-analog-clock__hand--${hand}`)
    .first()
    .evaluate((element) =>
      (element as HTMLElement).style.getPropertyValue('--tx-analog-clock-angle'),
    );

test.describe('analog clock', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date(2026, 10, 6, 14, 59, 30) });
    await page.goto('/components/analog-clock');
    await page.locator('main h1').first().waitFor();
  });

  test('shows the local time and turns forward past the hour', async ({ page }) => {
    const face = example(page, 'Basic').getByRole('img', { name: 'Local time, 14:59' });
    await expect(face).toBeVisible();
    expect(await angle(page, 'Basic', 'minute')).toBe('354deg');
    await page.clock.runFor(31000);
    await expect(
      example(page, 'Basic').getByRole('img', { name: 'Local time, 15:00' }),
    ).toBeVisible();
    expect(await angle(page, 'Basic', 'minute')).toBe('360deg');
    const hand = example(page, 'Basic').locator('.tx-analog-clock__hand--minute');
    const box = await hand.boundingBox();
    const faceBox = await example(page, 'Basic').locator('.tx-analog-clock__face').boundingBox();
    expect(
      Math.abs(
        (box?.x ?? 0) + (box?.width ?? 0) / 2 - ((faceBox?.x ?? 0) + (faceBox?.width ?? 0) / 2),
      ),
    ).toBeLessThan(2);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(
      (faceBox?.y ?? 0) + (faceBox?.height ?? 0) / 2 + 2,
    );
  });

  test('shows other time zones', async ({ page }) => {
    const tokyo = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Asia/Tokyo',
    }).format(new Date(2026, 10, 6, 14, 59, 30));
    await expect(
      example(page, 'Time zones').getByRole('img', { name: `Tokyo, ${tokyo}` }),
    ).toBeVisible();
  });

  test('follows a fixed time from a slider', async ({ page }) => {
    const frame = example(page, 'Fixed time');
    await expect(frame.getByRole('img', { name: 'Meeting starts, 09:30' })).toBeVisible();
    await frame.getByRole('slider').focus();
    await page.keyboard.press('ArrowRight');
    await expect(frame.getByRole('img', { name: 'Meeting starts, 09:45' })).toBeVisible();
    expect(await angle(page, 'Fixed time', 'minute')).toBe('270deg');
  });
});
