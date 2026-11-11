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
    paths: (chart.match(/class="tx-line-chart__line/g) ?? chart.match(/class="tx-column-chart__bar[ "]/g) ?? chart.match(/class="tx-pie-chart__segment[ "]/g) ?? chart.match(/class="tx-treemap__tile[ "]/g) ?? chart.match(/class="tx-rank-chart__line[ "]/g) ?? []).length,
    legend: (chart.match(/class="tx-chart-legend__item/g) ?? []).length,
    labels: [...chart.matchAll(/class="tx-chart-axes__label"[^>]*>\s*([^<]*?)\s*</g)].map((match) => match[1]),
  };
}

test.describe('charts', () => {
  for (const [path, tag, shape] of [
    ['/components/treemap', 'tx-treemap', '.tx-treemap__tile'],
    ['/components/rank-chart', 'tx-rank-chart', '.tx-rank-chart__line'],
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

  test('rank chart: rank 1 on top, tooltip with the note, keyboard, legend toggle', async ({ page }) => {
    await page.goto('/components/rank-chart');
    const basic = example(page, 'Basic').locator('tx-rank-chart');
    const labels = basic.locator('.tx-chart-axes__axis[data-position="left"] .tx-chart-axes__label');
    await expect(labels.first()).toHaveText('1');
    const top = await labels.first().boundingBox();
    const bottom = await labels.last().boundingBox();
    expect(top?.y ?? 0).toBeLessThan(bottom?.y ?? 0);
    await expect(basic.locator('.tx-rank-chart__line')).toHaveCount(3);

    const notes = example(page, 'Notes').locator('tx-rank-chart');
    await notes.scrollIntoViewIfNeeded();
    const last = notes.locator('.tx-rank-chart__marker').last();
    const box = await last.boundingBox();
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    await expect(tooltip(page)).toContainText('Position: 1');
    await expect(page.locator('.tx-chart-frame__tooltip-note')).toHaveText('Featured snippet');
    await page.mouse.click((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    await expect(example(page, 'Notes').locator('tx-message')).toContainText('position 1 — Featured snippet');
    await page.mouse.move(0, 0);
    await notes.locator('.tx-chart-frame__plot').focus();
    await page.keyboard.press('Home');
    await expect(tooltip(page)).toContainText('Position: 7');

    const legend = example(page, 'Legend').locator('tx-rank-chart');
    await legend.scrollIntoViewIfNeeded();
    await expect(legend.locator('.tx-rank-chart__line')).toHaveCount(5);
    await legend.locator('.tx-chart-legend__item').first().click();
    await expect(legend.locator('.tx-rank-chart__line')).toHaveCount(4);
  });

  test('org chart: drag, wheel zoom, path on hover, search focus, minimap, hotkeys, full screen', async ({ page }) => {
    await page.goto('/components/org-chart');
    const chart = example(page, 'Basic').locator('tx-org-chart');
    const canvas = chart.locator('.tx-org-chart__canvas');
    const stage = chart.locator('.tx-org-chart__stage');
    await canvas.scrollIntoViewIfNeeded();
    await expect(chart.locator('.tx-org-chart-card__title').first()).toHaveText('Ada Brooks');
    await expect(canvas).toHaveClass(/tx-org-chart__canvas--settled/);

    const box = await canvas.boundingBox();
    const cx = (box?.x ?? 0) + 40;
    const cy = (box?.y ?? 0) + (box?.height ?? 0) - 40;
    const before = await stage.boundingBox();
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 60, cy - 30, { steps: 4 });
    await page.mouse.up();
    await expect.poll(async () => Math.round(((await stage.boundingBox())?.x ?? 0) - (before?.x ?? 0))).toBe(60);
    expect(await page.evaluate(() => getSelection()?.toString() ?? '')).toBe('');

    const zoom = chart.locator('.tx-org-chart__zoom');
    const zoomBefore = await zoom.textContent();
    await page.mouse.wheel(0, -120);
    await expect(zoom).not.toHaveText(zoomBefore ?? '');
    await canvas.focus();
    await page.keyboard.press('0');
    await expect(zoom).toHaveText('100%');
    await page.keyboard.press('f');
    await expect(zoom).not.toHaveText('100%');

    const card = chart.locator('.tx-org-chart-node__card[data-org-id="infra"]');
    const cardBox = await card.boundingBox();
    await page.mouse.move((cardBox?.x ?? 0) + (cardBox?.width ?? 0) / 2, (cardBox?.y ?? 0) + (cardBox?.height ?? 0) / 2);
    await expect(chart.locator('.tx-org-chart__path path')).toHaveAttribute('d', /A /);
    await expect(chart.locator('.tx-org-chart-card__box--path')).toHaveCount(3);
    await page.mouse.move(0, 0);

    await canvas.focus();
    await page.keyboard.press('/');
    await expect(chart.locator('.tx-org-chart__bar input')).toBeFocused();
    await page.keyboard.type('gina');
    await expect(chart.locator('.tx-org-chart-card__box--match .tx-org-chart-card__title')).toHaveText('Gina Ives');
    await expect(chart.locator('tx-org-chart-toolbar tx-pill')).toHaveText('1 found');
    const match = await chart.locator('.tx-org-chart-card__box--match').boundingBox();
    const canvasBox = await canvas.boundingBox();
    await expect
      .poll(async () => {
        const current = await chart.locator('.tx-org-chart-card__box--match').boundingBox();
        return Math.abs((current?.x ?? 0) + (current?.width ?? 0) / 2 - ((canvasBox?.x ?? 0) + (canvasBox?.width ?? 0) / 2));
      })
      .toBeLessThan(4);
    expect(match).not.toBeNull();

    const map = chart.locator('.tx-org-chart__map');
    const frame = chart.locator('.tx-org-chart__map-viewport');
    const mapBox = await map.boundingBox();
    const frameBox = await frame.boundingBox();
    expect((frameBox?.y ?? 0) + 0.5).toBeGreaterThanOrEqual(mapBox?.y ?? 0);
    expect((frameBox?.y ?? 0) + (frameBox?.height ?? 0)).toBeLessThanOrEqual((mapBox?.y ?? 0) + (mapBox?.height ?? 0) + 0.5);
    const stageBefore = await stage.boundingBox();
    await map.click({ position: { x: 4, y: (mapBox?.height ?? 0) / 2 } });
    await expect.poll(async () => Math.round(((await stage.boundingBox())?.x ?? 0) - (stageBefore?.x ?? 0))).not.toBe(0);

    const far = await canvas.boundingBox();
    await page.mouse.move((far?.x ?? 0) + 30, (far?.y ?? 0) + 30);
    await page.mouse.down();
    for (let step = 0; step < 6; step++) {
      await page.mouse.move((far?.x ?? 0) + 30 - (step + 1) * 400, (far?.y ?? 0) + 30 - (step + 1) * 200);
    }
    await page.mouse.up();
    const away = await stage.boundingBox();
    expect((away?.x ?? 0) + (away?.width ?? 0)).toBeGreaterThanOrEqual((far?.x ?? 0) + 63);
    expect((away?.y ?? 0) + (away?.height ?? 0)).toBeGreaterThanOrEqual((far?.y ?? 0) + 63);
    await page.keyboard.press('f');

    const tokens = example(page, 'Design tokens');
    const leaf = tokens.locator('.tx-org-chart-node__card').nth(1);
    await leaf.scrollIntoViewIfNeeded();
    await leaf.hover();
    const ring = await tokens.locator('.tx-org-chart-card__box--path').first().evaluate((element) => getComputedStyle(element).boxShadow);
    const line = await tokens.locator('.tx-org-chart__path path').evaluate((element) => getComputedStyle(element).stroke);
    expect(ring).toContain(line);
    await page.mouse.move(0, 0);

    await chart.locator('.tx-org-chart__bar .tx-org-chart__more').click();
    await expect(page.locator('.tx-popover__arrow')).toBeVisible();
    await page.getByRole('menuitem', { name: 'Full screen' }).click();
    await expect(chart.locator('.tx-org-chart__canvas--native')).toHaveCount(1);
    const full = await canvas.boundingBox();
    const screen = await layoutViewport(page);
    expect(Math.round(full?.x ?? -1)).toBe(0);
    expect(Math.round(full?.y ?? -1)).toBe(0);
    expect(Math.round(full?.width ?? 0)).toBeGreaterThanOrEqual(screen.width);
    await page.keyboard.press('Escape');
    await expect(chart.locator('.tx-org-chart__canvas--fullscreen')).toHaveCount(0);
  });

  test('org chart on a phone: actions fold into a menu, a smaller minimap', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/components/org-chart');
    const chart = example(page, 'Basic').locator('tx-org-chart');
    await chart.scrollIntoViewIfNeeded();
    const bar = chart.locator('.tx-org-chart__bar');
    await expect(bar.locator('.tx-org-chart__zoom-group')).toBeHidden();
    await expect(bar.locator('.tx-org-chart__expand-group')).toBeHidden();
    const more = bar.locator('.tx-org-chart__more');
    await expect(more).toBeVisible();
    const search = await bar.locator('input').boundingBox();
    const moreBox = await more.boundingBox();
    expect(Math.abs((search?.y ?? 0) - (moreBox?.y ?? 0))).toBeLessThan(8);
    await more.click();
    await expect(page.locator('.tx-org-chart__menu-zoom')).toBeVisible();
    await expect(page.locator('.tx-popover__arrow')).toBeVisible();
    const expand = page.getByRole('menuitem', { name: 'Expand all' });
    await expand.click();
    await expect(expand).toBeHidden();
    await expect(chart.locator('.tx-org-chart-card__title', { hasText: 'Gina Ives' })).toBeVisible();
    const map = await chart.locator('.tx-org-chart__map').boundingBox();
    expect(map?.width ?? 0).toBeLessThanOrEqual(141);
  });

  test('tooltip arrow stays inside the panel and points at the value near the screen edge', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/components/line-chart');
    const plot = example(page, 'Basic').locator('tx-line-chart .tx-chart-frame__plot');
    await plot.scrollIntoViewIfNeeded();
    const box = await plot.boundingBox();
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) * 0.97, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    const arrow = await page.locator('.tx-chart-frame__tooltip-arrow').boundingBox();
    const panel = await tooltip(page).boundingBox();
    const crosshair = await example(page, 'Basic').locator('.tx-chart-frame__anchor').boundingBox();
    const tip = (arrow?.x ?? 0) + (arrow?.width ?? 0) / 2;
    expect(Math.abs(tip - ((crosshair?.x ?? 0) + (crosshair?.width ?? 0) / 2))).toBeLessThanOrEqual(1.5);
    expect(arrow?.x ?? 0).toBeGreaterThanOrEqual((panel?.x ?? 0) + 8);
    expect((arrow?.x ?? 0) + (arrow?.width ?? 0)).toBeLessThanOrEqual((panel?.x ?? 0) + (panel?.width ?? 0) - 8);
  });

  test('org chart full screen without the Fullscreen API covers the page from the top layer', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', { value: undefined, configurable: true });
      Object.defineProperty(HTMLElement.prototype, 'webkitRequestFullscreen', { value: undefined, configurable: true });
    });
    await page.goto('/components/org-chart');
    const chart = example(page, 'Basic').locator('tx-org-chart');
    const canvas = chart.locator('.tx-org-chart__canvas');
    await canvas.scrollIntoViewIfNeeded();
    await chart.locator('.tx-org-chart__bar .tx-org-chart__more').click();
    await page.getByRole('menuitem', { name: 'Full screen' }).click();
    await expect(canvas).toHaveClass(/tx-org-chart__canvas--top-layer/);
    expect(await canvas.evaluate((element) => element.matches(':popover-open'))).toBe(true);
    const box = await canvas.boundingBox();
    const screen = await layoutViewport(page);
    expect(box?.y ?? 0).toBeLessThan(16);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeGreaterThan(screen.height - 16);
    const onTop = await page.evaluate(() => {
      const element = document.elementFromPoint(innerWidth / 2, 24);
      return !!element?.closest('.tx-org-chart__canvas');
    });
    expect(onTop).toBe(true);
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
    await expect(chart.locator('.tx-org-chart__floating .tx-org-chart__fullscreen')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(canvas).not.toHaveClass(/tx-org-chart__canvas--fullscreen/);
    expect(await canvas.evaluate((element) => element.hasAttribute('popover'))).toBe(false);
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  });

  test('chart menu downloads SVG, PNG and CSV; the toolbar row keeps the pie legend inside', async ({ page }) => {
    await page.goto('/components/line-chart');
    const chart = example(page, 'Download').locator('tx-line-chart');
    await chart.scrollIntoViewIfNeeded();
    const button = chart.locator('.tx-chart-frame__menu-button');
    const legend = await chart.locator('tx-chart-legend').boundingBox();
    const buttonBox = await button.boundingBox();
    expect(Math.abs((buttonBox?.y ?? 0) + (buttonBox?.height ?? 0) / 2 - ((legend?.y ?? 0) + (legend?.height ?? 0) / 2))).toBeLessThan(6);
    const files: Record<string, string> = {};
    for (const label of ['Download SVG', 'Download PNG', 'Download CSV']) {
      await button.click();
      await expect(page.locator('.tx-popover__arrow')).toBeVisible();
      const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('menuitem', { name: label }).click()]);
      const stream = await download.createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) chunks.push(chunk as Buffer);
      files[download.suggestedFilename()] = Buffer.concat(chunks).toString(label === 'Download PNG' ? 'base64' : 'utf8');
    }
    expect(Object.keys(files).sort()).toEqual(['weekly-orders.csv', 'weekly-orders.png', 'weekly-orders.svg']);
    expect(files['weekly-orders.csv']).toContain('W1,320,24');
    expect(files['weekly-orders.svg']).toContain('>Orders<');
    expect(files['weekly-orders.svg']).not.toContain('var(--');
    expect(files['weekly-orders.png'].startsWith('iVBORw0KGgo')).toBe(true);

    await example(page, 'Download').getByRole('switch', { name: 'Chart menu' }).click();
    await expect(button).toHaveCount(0);

    await page.goto('/components/pie-chart');
    for (const pie of await page.locator('tx-pie-chart').all()) {
      const sizes = await pie.evaluate((element) => ({ host: element.getBoundingClientRect().bottom, frame: element.querySelector('tx-chart-frame')?.getBoundingClientRect().bottom ?? 0 }));
      expect(sizes.frame).toBeLessThanOrEqual(sizes.host + 1);
    }
  });
});
