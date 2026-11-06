import { Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.beforeEach(async ({ page }) => {
  await page.goto('/components/paginator');
  await page.locator('main h1').first().waitFor();
});

test('paginator moves with the keyboard and marks the current page', async ({ page }) => {
  const frame = example(page, 'Basic');
  const next = frame.getByRole('button', { name: 'Next page', exact: true });
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(frame.getByRole('button', { name: 'Page 2', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(frame.getByText('Page 2 of 12, records from 11')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(frame.getByRole('button', { name: 'Last page', exact: true })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(frame.getByRole('button', { name: 'Page 12', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(next).toBeDisabled();
});

test('page size select changes rows and keeps the first record', async ({ page }) => {
  const frame = example(page, 'Rows per page');
  await frame.getByRole('button', { name: 'Page 3', exact: true }).click();
  await expect(frame.getByText('20 rows per page, first record 41')).toBeVisible();
  await frame.getByRole('combobox', { name: 'Rows per page' }).click();
  await page.getByRole('option', { name: '10', exact: true }).click();
  await expect(frame.getByText('10 rows per page, first record 41')).toBeVisible();
  await expect(frame.getByRole('button', { name: 'Page 5', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('paginator fits one line on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  const frame = example(page, 'Total');
  const paginator = frame.locator('tx-paginator');
  await expect(paginator).toHaveClass(/tx-paginator--compact/);
  await expect(frame.getByRole('button', { name: 'First page' })).toHaveCount(0);
  await expect(frame.locator('.tx-paginator__page')).toHaveCount(3);
  const layout = await paginator.evaluate((host) => {
    const bar = host.querySelector('.tx-paginator__bar') as HTMLElement;
    const total = host.querySelector('.tx-paginator__total') as HTMLElement;
    const buttons = [...bar.querySelectorAll('.tx-paginator__nav')].map((button) => button.getBoundingClientRect().top);
    return {
      overflow: bar.scrollWidth - bar.clientWidth,
      oneLine: buttons.every((top) => Math.abs(top - buttons[0]) < 1),
      totalAbove: total.getBoundingClientRect().bottom <= bar.getBoundingClientRect().top,
    };
  });
  expect(layout.overflow).toBeLessThanOrEqual(0);
  expect(layout.oneLine).toBe(true);
  expect(layout.totalAbove).toBe(true);
});

test('total sits at the start of a wide paginator', async ({ page }) => {
  const paginator = example(page, 'Total').locator('tx-paginator');
  const layout = await paginator.evaluate((host) => {
    const total = (host.querySelector('.tx-paginator__total') as HTMLElement).getBoundingClientRect();
    const bar = (host.querySelector('.tx-paginator__bar') as HTMLElement).getBoundingClientRect();
    const box = host.getBoundingClientRect();
    return { startGap: total.left - box.left, sameRow: total.top < bar.bottom && total.bottom > bar.top, barCentre: bar.left + bar.width / 2 - (box.left + box.width / 2) };
  });
  expect(layout.startGap).toBeLessThan(1);
  expect(layout.sameRow).toBe(true);
  expect(Math.abs(layout.barCentre)).toBeLessThan(2);
});
