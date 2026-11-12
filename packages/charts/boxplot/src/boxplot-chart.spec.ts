import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxBoxplotChart } from './boxplot-chart.component';
import { TxBoxplotEvent, TxBoxplotSeries, TxBoxplotSeriesToggle } from './boxplot-chart.types';
import { boxStats, quantile, toBoxStats } from './boxplot-stats';

@Component({
  imports: [TxBoxplotChart],
  template: `<tx-boxplot-chart id="main" [series]="series()" [categories]="['Mon', 'Tue']" [showOutliers]="outliers()" [pt]="{ box: { class: 'own-box' } }" (boxClick)="clicks.push($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly series = signal<TxBoxplotSeries[]>([
    { name: 'API', data: [[12, 14, 15, 16, 18, 19, 21, 60], { min: 10, q1: 14, median: 17, q3: 22, max: 30, outliers: [45] }] },
    { name: 'Web', data: [[20, 22, 25, 27, 29], null] },
  ]);
  readonly outliers = signal(true);
  readonly clicks: TxBoxplotEvent[] = [];
}

describe('boxplot stats', () => {
  it('computes quartiles and keeps far values as outliers', () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    const stats = boxStats([12, 14, 15, 16, 18, 19, 21, 60]);
    expect(stats).toEqual({ min: 12, q1: 14.75, median: 17, q3: 19.5, max: 21, outliers: [60] });
    expect(boxStats([])).toBeNull();
    expect(toBoxStats({ min: 1, q1: 2, median: 3, q3: 4, max: Number.NaN })).toBeNull();
    expect(quantile([], 0.5)).toBeNaN();
    expect(toBoxStats(null)).toBeNull();
  });

  it('falls back to the quartiles for whiskers when the spread overflows', () => {
    const stats = boxStats([-1.7e308, 1.7e308]);
    expect(stats).toMatchObject({ min: stats?.q1, max: stats?.q3, outliers: [] });
    expect(stats?.q1).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('TxBoxplotChart', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('#main .tx-chart-frame__plot');

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('draws boxes side by side with medians, whiskers and outliers', () => {
    expect(all('#main .tx-boxplot-chart__box')).toHaveLength(3);
    expect(el('#main .tx-boxplot-chart__box').classList).toContain('own-box');
    expect(all('#main .tx-boxplot-chart__median')).toHaveLength(3);
    expect(all('#main .tx-boxplot-chart__cap')).toHaveLength(6);
    expect(all('#main .tx-boxplot-chart__outlier')).toHaveLength(2);
    const [api, web] = all('#main .tx-boxplot-chart__item[data-index="0"] .tx-boxplot-chart__box');
    expect(Number(web.getAttribute('x'))).toBeGreaterThan(Number(api.getAttribute('x')) + Number(api.getAttribute('width')));
    expect(plot().getAttribute('aria-label')).toBe('Box plot, 2 series, 2 values');
  });

  it('hides the outliers', async () => {
    fixture.componentInstance.outliers.set(false);
    await fixture.whenStable();
    expect(all('#main .tx-boxplot-chart__outlier')).toHaveLength(0);
  });

  it('reads a box with the keyboard: the five numbers', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main .tx-boxplot-chart__item--active').getAttribute('data-index')).toBe('1');
    expect(el('#main .tx-chart-hover-band--on')).not.toBeNull();
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Tue');
    expect(panel.textContent).toContain('Median');
    expect(panel.textContent).toContain('17');
    expect(panel.textContent).toContain('Outliers');
  });

  it('reports the clicked box', () => {
    const box = all('#main .tx-boxplot-chart__box')[1];
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(box.getAttribute('x')) + 2, clientY: Number(box.getAttribute('y')) + 2, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toMatchObject({ seriesIndex: 0, dataPointIndex: 1, category: 'Tue', stats: { median: 17 } });
  });

  it('hides a series from the legend', async () => {
    all('#main .tx-chart-legend__item')[1].click();
    await fixture.whenStable();
    expect(all('#main .tx-boxplot-chart__box')).toHaveLength(2);
  });
});

@Component({
  imports: [TxBoxplotChart],
  template: `
    <tx-boxplot-chart
      id="opts"
      [series]="series()"
      [categories]="categories()"
      [ariaLabel]="ariaLabel()"
      [dt]="dt()"
      (boxClick)="clicks.push($event)"
      (seriesToggle)="toggles.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OptionsHost {
  readonly series = signal<TxBoxplotSeries[] | null>([
    { name: 'API', data: [{ min: 10, q1: 14, median: 17, q3: 22, max: 30 }, null] },
    { name: 'Web', data: [{ min: 12, q1: 15, median: 18, q3: 20, max: 26 }, [5, 6, 7]] },
  ]);
  readonly categories = signal<string[] | null>(['Mon']);
  readonly ariaLabel = signal('');
  readonly dt = signal<Record<string, Record<string, string>> | undefined>(undefined);
  readonly clicks: TxBoxplotEvent[] = [];
  readonly toggles: TxBoxplotSeriesToggle[] = [];
}

describe('TxBoxplotChart options', () => {
  let fixture: ComponentFixture<OptionsHost>;
  let host: OptionsHost;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('#opts .tx-chart-frame__plot');
  const tooltip = () => document.querySelector('.tx-chart-frame__tooltip') as HTMLElement | null;
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const pointer = async (type: string, x: number, y: number) => {
    plot().dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
    await fixture.whenStable();
  };
  const boxes = () => all('#opts .tx-boxplot-chart__box');

  beforeEach(async () => {
    fixture = TestBed.createComponent(OptionsHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('numbers missing categories and prefixes the summary', async () => {
    host.ariaLabel.set('Latency');
    await fixture.whenStable();
    expect(el('#opts .tx-chart-axes__axis[data-position="bottom"]').textContent).toContain('2');
    expect(plot().getAttribute('aria-label')).toBe('Latency. Box plot, 2 series, 2 values');
    expect(all('#opts tbody tr').map((row) => row.querySelector('th, td')?.textContent?.trim())).toEqual(['API, Mon', 'Web, Mon', 'Web, 2']);
    host.categories.set(null);
    await fixture.whenStable();
    expect(el('#opts .tx-chart-axes__axis[data-position="bottom"]').textContent).toContain('1');
  });

  it('labels table rows by category alone for one series', async () => {
    host.series.set([{ name: 'API', data: [[1, 2, 3, 4, 5]] }]);
    await fixture.whenStable();
    expect(el('#opts .tx-chart-legend')).toBeNull();
    expect(all('#opts tbody tr')[0].querySelector('th, td')?.textContent?.trim()).toBe('Mon');
  });

  it('walks the series with the arrows and reads an empty slot', async () => {
    await key('ArrowRight');
    expect(tooltip()?.textContent).toContain('API');
    expect(tooltip()?.textContent).not.toContain('Outliers');
    await key('ArrowDown');
    expect(tooltip()?.textContent).toContain('Web');
    await key('ArrowUp');
    await key('ArrowRight');
    expect(el('#opts .tx-boxplot-chart__item--active')).toBeNull();
    expect(tooltip()).toBeNull();
    await key('Escape');
    expect(el('#opts .tx-chart-hover-band--on')).toBeNull();
  });

  it('does nothing on the keyboard when every series is hidden', async () => {
    all('#opts .tx-chart-legend__item').forEach((item) => item.click());
    await fixture.whenStable();
    expect(host.toggles.map((toggle) => toggle.hidden)).toEqual([true, true]);
    await key('ArrowDown');
    expect(tooltip()).toBeNull();
  });

  it('drops the active box when its series is hidden', async () => {
    await key('ArrowRight');
    expect(tooltip()).not.toBeNull();
    all('#opts .tx-chart-legend__item')[0].click();
    await fixture.whenStable();
    expect(tooltip()).toBeNull();
    expect(host.toggles[0]).toEqual({ seriesIndex: 0, name: 'API', hidden: true });
  });

  it('picks the nearest box under the pointer and clears outside', async () => {
    const [api, web] = boxes();
    const webCenter = Number(web.getAttribute('x')) + Number(web.getAttribute('width')) / 2;
    const apiCenter = Number(api.getAttribute('x')) + Number(api.getAttribute('width')) / 2;
    await pointer('pointermove', webCenter, Number(web.getAttribute('y')) + 1);
    expect(tooltip()?.textContent).toContain('Web');
    await pointer('click', apiCenter, Number(api.getAttribute('y')) + 1);
    expect(host.clicks[0]).toMatchObject({ seriesIndex: 0, dataPointIndex: 0, category: 'Mon' });
    await pointer('pointermove', -50, -50);
    expect(tooltip()).toBeNull();
    await pointer('pointermove', webCenter, Number(web.getAttribute('y')) + 1);
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(el('#opts .tx-chart-hover-band--on')).toBeNull();
  });

  it('dims the other series while a legend item is hovered', async () => {
    const items = all('#opts .tx-chart-legend__item');
    items[0].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(el('#opts').classList).toContain('tx-boxplot-chart--focused');
    items[0].dispatchEvent(new Event('pointerleave'));
    await fixture.whenStable();
    expect(el('#opts').classList).not.toContain('tx-boxplot-chart--focused');
    items[0].click();
    await fixture.whenStable();
    items[0].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(el('#opts').classList).not.toContain('tx-boxplot-chart--focused');
  });

  it('reads the box geometry from its tokens', async () => {
    const before = Number(boxes()[0].getAttribute('width'));
    host.dt.set({ boxplot: { boxWidth: '0.2' } });
    await fixture.whenStable();
    expect(el('#opts').style.getPropertyValue('--tx-chart-boxplot-box-width')).toBe('0.2');
    expect(Number(boxes()[0].getAttribute('width'))).toBeLessThan(before);
  });

  it('shows "No data" without series', async () => {
    host.series.set(null);
    await fixture.whenStable();
    expect(el('#opts .tx-chart-frame__empty').textContent).toContain('No data');
  });
});

describe('TxBoxplotChart recompiled by TestBed', () => {
  it('still draws its boxes when a test overrides the component', async () => {
    TestBed.overrideComponent(TxBoxplotChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-boxplot-chart__box')).toHaveLength(3);
  });
});
