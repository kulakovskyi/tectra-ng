import { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { layoutViewport } from './helpers';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

const tooltip = (page: Page) => page.locator('.tx-chart-frame__tooltip');

async function hoverAt(page: Page, target: Locator, x: number, y: number): Promise<void> {
  const box = await target.boundingBox();
  if (!box) throw new Error('no box');
  await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
}

function serverChart(html: string, tag: string): { paths: number; legend: number; labels: string[] } {
  const start = html.indexOf(`<${tag}`);
  const chart = html.slice(start, html.indexOf(`</${tag}>`, start));
  return {
    paths: (chart.match(/class="tx-line-chart__line/g) ?? chart.match(/class="tx-column-chart__bar[ "]/g) ?? chart.match(/class="tx-pie-chart__segment[ "]/g) ?? []).length,
    legend: (chart.match(/class="tx-chart-legend__item/g) ?? []).length,
    labels: [...chart.matchAll(/class="tx-chart-axes__label"[^>]*>\s*([^<]*?)\s*</g)].map((match) => match[1]),
  };
}

test.describe('charts', () => {
  for (const [path, tag, shape] of [
    ['/components/line-chart', 'tx-line-chart', '.tx-line-chart__line'],
    ['/components/column-chart', 'tx-column-chart', '.tx-column-chart__bar'],
    ['/components/pie-chart', 'tx-pie-chart', '.tx-pie-chart__segment'],
  ] as const) {
    test(`${tag}: the hydrated chart keeps the server markup and its box`, async ({ page, request }) => {
      const server = serverChart(await (await request.get(path)).text(), tag);
      expect(server.paths).toBeGreaterThan(0);
      await page.goto(path);
      const chart = example(page, 'Basic').locator(tag);
      await expect(chart.locator(shape).first()).toBeVisible();
      expect(await chart.locator(shape).count()).toBe(server.paths);
      expect(await chart.locator('.tx-chart-legend__item').count()).toBe(server.legend);
      if (server.labels.length) {
        const labels = await chart.locator('.tx-chart-axes__axis[data-position="bottom"] .tx-chart-axes__label').allTextContents();
        expect(labels.map((label) => label.trim()).every((label) => server.labels.includes(label))).toBe(true);
      }
      expect(await chart.evaluate((element) => element.classList.contains(`${element.localName}--entering`))).toBe(false);
    });
  }

  test('line chart: redraws on resize to the real width', async ({ page }) => {
    await page.goto('/components/line-chart');
    const chart = example(page, 'Basic').locator('tx-line-chart');
    const svg = chart.locator('svg.tx-chart-frame__svg');
    const width = async () => Number((await svg.getAttribute('viewBox'))?.split(' ')[2]);
    expect(Math.abs((await width()) - ((await svg.boundingBox())?.width ?? 0))).toBeLessThanOrEqual(1);
    await page.setViewportSize({ width: 820, height: 900 });
    await expect.poll(async () => Math.abs((await width()) - ((await svg.boundingBox())?.width ?? 0))).toBeLessThanOrEqual(1);
    const box = await chart.boundingBox();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual((await layoutViewport(page)).width);
  });

  test('line chart: tooltip on hover and on the keyboard, legend toggle', async ({ page }) => {
    await page.goto('/components/line-chart');
    const chart = example(page, 'Basic').locator('tx-line-chart');
    const plot = chart.locator('.tx-chart-frame__plot');
    await plot.scrollIntoViewIfNeeded();
    await hoverAt(page, plot, 0.5, 0.5);
    await expect(tooltip(page)).toBeVisible();
    await expect(tooltip(page)).toContainText('Visits');
    const rule = chart.locator('.tx-line-chart__crosshair');
    await expect(rule).toHaveCount(1);
    await expect(tooltip(page)).toHaveAttribute('data-side', 'top');
    const tip = await tooltip(page).boundingBox();
    const line = await rule.boundingBox();
    expect(tip && line && tip.y + tip.height <= line.y + 1).toBeTruthy();
    expect(tip && line && Math.abs(tip.x + tip.width / 2 - (line.x + line.width / 2))).toBeLessThanOrEqual(2);
    await page.mouse.move(0, 0);
    await expect(tooltip(page)).toHaveCount(0);

    await plot.focus();
    await page.keyboard.press('ArrowRight');
    await expect(tooltip(page)).toContainText('Jan');
    await page.keyboard.press('End');
    await expect(tooltip(page)).toContainText('Dec');
    await expect(page.locator('.cdk-live-announcer-element')).toContainText('Dec');
    await page.keyboard.press('Escape');
    await expect(tooltip(page)).toHaveCount(0);

    const legend = chart.locator('.tx-chart-legend__item').first();
    await legend.click();
    await expect(legend).toHaveAttribute('aria-pressed', 'false');
    await expect(chart.locator('.tx-line-chart__line')).toHaveCount(1);
    await legend.click();
    await expect(chart.locator('.tx-line-chart__line')).toHaveCount(2);
  });

  test('line chart: the tooltip of a custom template and the controls of the examples', async ({ page }) => {
    await page.goto('/components/line-chart');
    const custom = example(page, 'Tooltip').locator('tx-line-chart').nth(1);
    await custom.scrollIntoViewIfNeeded();
    await hoverAt(page, custom.locator('.tx-chart-frame__plot'), 0.3, 0.5);
    await expect(tooltip(page)).toContainText('orders');
    await page.mouse.move(0, 0);

    const stacked = example(page, 'Stacked');
    await stacked.getByText('Show as 100%', { exact: true }).click();
    await expect(stacked.locator('.tx-chart-axes__axis[data-position="left"] .tx-chart-axes__label').last()).toHaveText('100%');

    const loading = example(page, 'Loading and empty');
    await expect(loading.locator('.tx-chart-frame__empty')).toContainText('No data');
    await loading.getByRole('button', { name: 'Load data' }).click();
    await expect(loading.locator('tx-skeleton')).toBeVisible();
    await expect(loading.locator('.tx-line-chart__line')).toHaveCount(1);
  });

  test('column chart: hover on the column pins the tooltip above it, horizontal bars fit', async ({ page }) => {
    await page.goto('/components/column-chart');
    const chart = example(page, 'Basic').locator('tx-column-chart');
    const plot = chart.locator('.tx-chart-frame__plot');
    await plot.scrollIntoViewIfNeeded();
    const bar = chart.locator('.tx-column-chart__bar[data-index="3"][data-end="top"]');
    const barBox = await bar.boundingBox();
    if (!barBox) throw new Error('no bar');
    await page.mouse.move(barBox.x + barBox.width / 2, barBox.y + barBox.height / 2);
    await expect(tooltip(page)).toContainText('Thu');
    await expect(tooltip(page)).toContainText('Total');
    await expect(chart).toHaveClass(/tx-column-chart--active/);
    const tip = await tooltip(page).boundingBox();
    expect(tip && tip.y + tip.height <= barBox.y + 1).toBeTruthy();
    expect(tip && Math.abs(tip.x + tip.width / 2 - (barBox.x + barBox.width / 2))).toBeLessThanOrEqual(2);
    const next = await chart.locator('.tx-column-chart__bar[data-index="4"]').first().boundingBox();
    await page.mouse.move((barBox.x + barBox.width + (next?.x ?? barBox.x + barBox.width + 40)) / 2, barBox.y + barBox.height / 2);
    await expect(tooltip(page)).toHaveCount(0);
    await page.mouse.move(0, 0);

    const horizontal = example(page, 'Horizontal').locator('tx-column-chart');
    await horizontal.scrollIntoViewIfNeeded();
    const bars = horizontal.locator('.tx-column-chart__bar');
    const frame = await horizontal.boundingBox();
    for (const bar of await bars.all()) {
      const box = await bar.boundingBox();
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual((frame?.x ?? 0) + (frame?.width ?? 0) + 0.5);
    }
  });

  test('pie chart: hover shows the segment in the centre, the side legend leaves room', async ({ page }) => {
    await page.goto('/components/pie-chart');
    const chart = example(page, 'Basic').locator('tx-pie-chart');
    await chart.scrollIntoViewIfNeeded();
    await expect(chart.locator('.tx-pie-chart__center-name')).toHaveText('Visits');
    await hoverAt(page, chart.locator('.tx-chart-frame__plot'), 0.85, 0.5);
    await expect(chart.locator('.tx-pie-chart__center-name')).toHaveText('Search');
    await expect(tooltip(page)).toContainText('Search');
    await expect(tooltip(page)).toContainText('42%');
    await expect(chart.locator('.tx-pie-chart__segment--hovered')).toHaveCount(1);
    await page.mouse.move(0, 0);

    const variants = example(page, 'Legend variants');
    await variants.locator('tx-select').click();
    await page.getByRole('option', { name: 'Stat', exact: true }).click();
    await expect(variants.locator('tx-chart-legend')).toHaveAttribute('data-variant', 'stat');
    await expect(variants.locator('.tx-chart-legend__stat').first()).toHaveText('38');

    const side = example(page, 'Legend values').locator('tx-pie-chart');
    await side.scrollIntoViewIfNeeded();
    const svg = await side.locator('svg.tx-chart-frame__svg').boundingBox();
    expect(svg?.width).toBeGreaterThan(150);
    await expect(side.locator('.tx-chart-legend__percent').first()).toHaveText('38%');
  });
});
