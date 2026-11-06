import { Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.describe('sparkline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/sparkline');
    await page.locator('main h1').first().waitFor();
  });

  test('stretches to its container and keeps the line width', async ({ page }) => {
    const basic = example(page, 'Basic').locator('tx-sparkline');
    const box = await basic.boundingBox();
    expect(box?.width).toBe(320);
    expect(box?.height).toBe(31.5);
    const svg = await basic.locator('svg').boundingBox();
    expect(svg?.width).toBe(320);
    const row = example(page, 'Size').locator('tx-sparkline').first();
    expect((await row.boundingBox())?.height).toBe(24);
    for (const sparkline of [basic, row]) {
      expect(
        await sparkline
          .locator('.tx-sparkline__line')
          .evaluate((line) => getComputedStyle(line).vectorEffect),
      ).toBe('non-scaling-stroke');
    }
  });

  test('redraws with new values', async ({ page }) => {
    const frame = example(page, 'Live');
    const line = frame.locator('.tx-sparkline__line');
    const before = await line.getAttribute('d');
    await frame.getByRole('button', { name: 'Add a reading' }).click();
    await expect(frame.getByText('Latest: 34% CPU')).toBeVisible();
    await expect(line).not.toHaveAttribute('d', before ?? '');
  });

  test('is an image only when it has a label', async ({ page }) => {
    await expect(
      example(page, 'Accessible').getByRole('img', {
        name: 'Revenue rose from 4,200 to 6,900 EUR over 8 weeks',
      }),
    ).toBeVisible();
    await expect(example(page, 'Basic').locator('tx-sparkline')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
