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
    paths: (chart.match(/class="tx-line-chart__line/g) ?? chart.match(/class="tx-column-chart__bar[ "]/g) ?? chart.match(/class="tx-pie-chart__segment[ "]/g) ?? chart.match(/class="tx-treemap__tile[ "]/g) ?? []).length,
    legend: (chart.match(/class="tx-chart-legend__item/g) ?? []).length,
    labels: [...chart.matchAll(/class="tx-chart-axes__label"[^>]*>\s*([^<]*?)\s*</g)].map((match) => match[1]),
  };
}

test.describe('charts', () => {
  for (const [path, tag, shape] of [
    ['/components/treemap', 'tx-treemap', '.tx-treemap__tile'],
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

  test('bar list: server rows hydrate, link rows hover and take focus, limit and loading work', async ({ page, request }) => {
    const html = await (await request.get('/components/bar-list')).text();
    const start = html.indexOf('<tx-bar-list');
    const serverRows = (html.slice(start, html.indexOf('</tx-bar-list>', start)).match(/class="tx-bar-list__row[ "]/g) ?? []).length;
    expect(serverRows).toBe(5);
    await page.goto('/components/bar-list');
    const basic = example(page, 'Basic').locator('tx-bar-list');
    await expect(basic.locator('.tx-bar-list__row')).toHaveCount(serverRows);
    await expect(basic.locator('.tx-bar-list__label').first()).toHaveText('Germany');
    await expect(basic.locator('.tx-bar-list__percent').first()).toHaveText('33.2%');
    const track = await basic.locator('.tx-bar-list__track').first().boundingBox();
    const bar = await basic.locator('.tx-bar-list__bar').first().boundingBox();
    expect(Math.abs((bar?.width ?? 0) - (track?.width ?? 0))).toBeLessThanOrEqual(1);
    expect(track?.height).toBeCloseTo(28, 0);

    const link = example(page, 'Links').locator('a.tx-bar-list__row--link').first();
    await link.scrollIntoViewIfNeeded();
    const before = await link.evaluate((element) => getComputedStyle(element).backgroundColor);
    await link.hover();
    await expect.poll(() => link.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(before);
    await expect(link).toHaveAttribute('href', '/components/line-chart');
    await link.focus();
    await expect(link).toBeFocused();

    const limit = example(page, 'Limit');
    await expect(limit.locator('.tx-bar-list__row')).toHaveCount(3);
    await limit.locator('tx-select').click();
    await page.getByRole('option', { name: 'Top 5', exact: true }).click();
    await expect(limit.locator('.tx-bar-list__row')).toHaveCount(5);

    const loading = example(page, 'Loading and empty');
    await expect(loading.locator('.tx-bar-list__empty')).toHaveText('No data');
    await loading.getByRole('button', { name: 'Load data' }).click();
    await expect(loading.locator('tx-skeleton').first()).toBeVisible();
    await expect(loading.locator('.tx-bar-list__row')).toHaveCount(3);
    await loading.getByRole('button', { name: 'Clear' }).click();
    await expect(loading.locator('.tx-bar-list__empty')).toBeVisible();
  });

  test('segmented bar: server segments hydrate, the large bar fits its percents, legend switches work', async ({ page, request }) => {
    const html = await (await request.get('/components/segmented-bar')).text();
    const start = html.indexOf('<tx-segmented-bar');
    const serverSegments = (html.slice(start, html.indexOf('</tx-segmented-bar>', start)).match(/class="tx-segmented-bar__segment[ "]/g) ?? []).length;
    expect(serverSegments).toBe(3);
    await page.goto('/components/segmented-bar');
    const basic = example(page, 'Basic').locator('tx-segmented-bar');
    await expect(basic.locator('.tx-segmented-bar__segment')).toHaveCount(serverSegments);
    const track = await basic.locator('.tx-segmented-bar__track').boundingBox();
    expect(track?.height).toBeCloseTo(7, 0);
    await expect(basic.locator('.tx-segmented-bar__segment').first()).toHaveAttribute('title', 'Paid: 42');

    const large = example(page, 'Large').locator('tx-segmented-bar');
    await large.scrollIntoViewIfNeeded();
    expect((await large.locator('.tx-segmented-bar__track').boundingBox())?.height).toBeCloseTo(31.5, 0);
    for (const segment of await large.locator('.tx-segmented-bar__segment').all()) {
      expect(await segment.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    }

    const legend = example(page, 'Legend');
    const bar = legend.locator('tx-segmented-bar');
    await expect(bar.locator('.tx-segmented-bar__legend-item')).toHaveCount(4);
    await legend.getByRole('switch', { name: 'Hide empty' }).click();
    await expect(bar.locator('.tx-segmented-bar__legend-item')).toHaveCount(3);
    await legend.getByRole('switch', { name: 'Legend' }).click();
    await expect(bar.locator('.tx-segmented-bar__legend')).toHaveCount(0);
    await expect(bar.locator('.tx-segmented-bar__track')).toHaveAttribute('role', 'img');
  });

  test('heatmap: server cells hydrate, headers stick while scrolling, cells click, tooltip and calendar', async ({ page, request }) => {
    const html = await (await request.get('/components/heatmap')).text();
    const start = html.indexOf('<tx-heatmap');
    const serverCells = (html.slice(start, html.indexOf('</tx-heatmap>', start)).match(/<tx-heatmap-cell/g) ?? []).length;
    expect(serverCells).toBe(81);
    await page.goto('/components/heatmap');
    const basic = example(page, 'Basic').locator('tx-heatmap');
    await expect(basic.locator('tx-heatmap-cell')).toHaveCount(serverCells);
    await expect(basic.locator('.tx-heatmap__row:not(.tx-heatmap__row--head) tx-heatmap-cell')).toHaveCount(75);
    const box = await basic.locator('.tx-heatmap-cell__box--success').first().boundingBox();
    expect(box?.width).toBeCloseTo(14, 0);
    await basic.locator('.tx-heatmap-cell__box--success').first().hover();
    await expect(page.locator('.tx-tooltip').first()).toContainText('passed');

    const scroll = example(page, 'Scroll').locator('.tx-heatmap__scroll');
    await scroll.scrollIntoViewIfNeeded();
    const head = scroll.locator('.tx-heatmap__row--head');
    const lead = scroll.locator('.tx-heatmap__row:not(.tx-heatmap__row--head) .tx-heatmap__lead').first();
    const value = scroll.locator('.tx-heatmap__row:not(.tx-heatmap__row--head) .tx-heatmap__value').first();
    const frame = await scroll.boundingBox();
    await scroll.evaluate((element) => element.scrollTo({ top: 80, left: 200 }));
    await expect.poll(async () => Math.round((await head.boundingBox())?.y ?? 0)).toBe(Math.round(frame?.y ?? 0));
    expect(Math.round((await lead.boundingBox())?.x ?? 0)).toBe(Math.round(frame?.x ?? 0));
    const valueBox = await value.boundingBox();
    expect((valueBox?.x ?? 0) + (valueBox?.width ?? 0)).toBeLessThanOrEqual((frame?.x ?? 0) + (frame?.width ?? 0) + 1);

    await scroll.evaluate((element) => element.scrollTo({ top: element.scrollHeight }));
    const before = await page.evaluate(() => document.scrollingElement?.scrollTop ?? 0);
    const scrollBox = await scroll.boundingBox();
    await page.mouse.move((scrollBox?.x ?? 0) + (scrollBox?.width ?? 0) / 2, (scrollBox?.y ?? 0) + (scrollBox?.height ?? 0) / 2);
    await page.mouse.wheel(0, 300);
    await expect.poll(() => page.evaluate(() => document.scrollingElement?.scrollTop ?? 0)).toBeGreaterThan(before);

    const plain = example(page, 'Pass through').locator('.tx-heatmap__scroll');
    await plain.scrollIntoViewIfNeeded();
    const top = await page.evaluate(() => document.scrollingElement?.scrollTop ?? 0);
    const plainBox = await plain.boundingBox();
    await page.mouse.move((plainBox?.x ?? 0) + 40, (plainBox?.y ?? 0) + (plainBox?.height ?? 0) / 2);
    await page.mouse.wheel(0, 300);
    await expect.poll(() => page.evaluate(() => document.scrollingElement?.scrollTop ?? 0)).toBeGreaterThan(top);

    const interactive = example(page, 'Interactive');
    const cell = interactive.locator('button.tx-heatmap-cell__box').first();
    await cell.scrollIntoViewIfNeeded();
    await cell.click();
    await expect(interactive.locator('tx-message')).toContainText('January 2024');
    await interactive.locator('button.tx-heatmap-cell__box').nth(1).focus();
    await page.keyboard.press('Enter');
    await expect(interactive.locator('tx-message')).toContainText('February 2024');

    const calendar = example(page, 'Calendar').locator('tx-heatmap');
    await expect(calendar.locator('.tx-heatmap__group-label')).toHaveCount(12);
    await expect(calendar.locator('.tx-heatmap-cell__box--scale').first()).toBeVisible();
  });

  test('treemap: tiles fill the plot, tooltip on hover and keyboard, nested click', async ({ page }) => {
    await page.goto('/components/treemap');
    const chart = example(page, 'Basic').locator('tx-treemap');
    const plot = chart.locator('svg.tx-chart-frame__svg');
    const tiles = chart.locator('.tx-treemap__tile');
    await expect(tiles).toHaveCount(8);
    const box = await plot.boundingBox();
    const areas = await tiles.evaluateAll((elements) => elements.reduce((sum, element) => sum + Number(element.getAttribute('width')) * Number(element.getAttribute('height')), 0));
    const viewBox = (await plot.getAttribute('viewBox'))?.split(' ').map(Number) ?? [];
    expect(areas).toBeCloseTo(viewBox[2] * viewBox[3], -1);
    expect(Math.abs(viewBox[2] - (box?.width ?? 0))).toBeLessThanOrEqual(1);
    await tiles.first().hover();
    await expect(tooltip(page)).toContainText('Hosting');
    await expect(tooltip(page)).toContainText('33');
    await page.mouse.move(0, 0);
    await chart.locator('.tx-chart-frame__plot').focus();
    await page.keyboard.press('End');
    await expect(tooltip(page)).toContainText('Other');

    const nested = example(page, 'Nested');
    await nested.locator('.tx-treemap__group-label').first().scrollIntoViewIfNeeded();
    await expect(nested.locator('.tx-treemap__group-label')).toHaveCount(3);
    const germany = nested.locator('.tx-treemap__tile-label', { hasText: 'Germany' });
    const rect = await germany.boundingBox();
    await page.mouse.click((rect?.x ?? 0) + 4, (rect?.y ?? 0) + 4);
    await expect(nested.locator('tx-message')).toContainText('Europe / Germany: 4200');

    for (const id of ['Pass through', 'Labels']) {
      for (const label of await example(page, id).locator('.tx-treemap__tile-label').all()) {
        const content = await label.locator('xpath=..').boundingBox();
        const text = await label.boundingBox();
        expect((text?.x ?? 0) + (text?.width ?? 0)).toBeLessThanOrEqual((content?.x ?? 0) + (content?.width ?? 0) + 0.5);
      }
    }
    await expect(example(page, 'Tile template').locator('.share').first()).toHaveText(/%$/);
  });
});
