import { Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.describe('month calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/month-calendar');
    await page.locator('main h1').first().waitFor();
  });

  test('draws a bar across its days and continues it on the next week', async ({ page }) => {
    const frame = example(page, 'Basic');
    const bar = frame.locator('.tx-month-calendar__event', { hasText: 'Sprint 42' });
    const monday = frame.locator('[data-day-key="2026-10-05"]');
    const friday = frame.locator('[data-day-key="2026-10-09"]');
    const barBox = await bar.boundingBox();
    const mondayBox = await monday.boundingBox();
    const fridayBox = await friday.boundingBox();
    expect(Math.abs((barBox?.x ?? 0) - (mondayBox?.x ?? 0))).toBeLessThan(6);
    expect(
      Math.abs(
        (barBox?.x ?? 0) + (barBox?.width ?? 0) - ((fridayBox?.x ?? 0) + (fridayBox?.width ?? 0)),
      ),
    ).toBeLessThan(6);
    await expect(frame.locator('.tx-month-calendar__event', { hasText: 'Vacation' })).toHaveCount(
      2,
    );
    await expect(frame.locator('.tx-month-calendar__marker-dot').first()).toBeHidden();
    await expect(frame.locator('tx-pill', { hasText: 'Payday' })).toBeVisible();
  });

  test('moves the focus with the arrows and reports clicks', async ({ page }) => {
    const frame = example(page, 'Navigation');
    await frame.getByRole('button', { name: 'Today', exact: true }).click();
    const focused = frame.locator('.tx-month-calendar__day[tabindex="0"]');
    await focused.focus();
    const start = await focused.getAttribute('data-day-key');
    await page.keyboard.press('ArrowDown');
    const next = await page.evaluate(() => document.activeElement?.getAttribute('data-day-key'));
    expect(new Date(next ?? '').getTime() - new Date(start ?? '').getTime()).toBe(7 * 86400000);
    await page.keyboard.press('Enter');
    await expect(frame.locator('.hint')).toContainText(
      `Selected ${new Date(next ?? '').toDateString()}`,
    );
  });

  test('shows dots instead of bars when narrow', async ({ page }) => {
    const frame = example(page, 'Compact');
    await expect(frame.locator('.tx-month-calendar__event').first()).toBeHidden();
    await expect(frame.locator('.tx-month-calendar__dot').first()).toBeVisible();
    await expect(frame.locator('.tx-month-calendar__marker-dot').first()).toBeVisible();
  });

  test('moves extra events to +N and back when rows are added', async ({ page }) => {
    const frame = example(page, 'Lanes');
    await expect(frame.getByText('+2 more')).toBeVisible();
    await frame.getByRole('combobox', { name: 'Bar rows' }).click();
    await page.getByRole('option', { name: '4 rows per week' }).click();
    await expect(frame.locator('.tx-month-calendar__more')).toHaveCount(0);
  });
});
