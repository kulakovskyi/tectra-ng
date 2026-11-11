import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxBoxplotChart } from './boxplot-chart.component';
import { TxBoxplotEvent, TxBoxplotSeries } from './boxplot-chart.types';
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
