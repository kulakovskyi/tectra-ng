import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxScatterChart } from './scatter-chart.component';
import { TxScatterChartPointEvent, TxScatterSeries } from './scatter-chart.types';
import { bubbleRadius, linearTrend, nearestDot, scatterData } from './scatter-layout';

@Component({
  imports: [TxScatterChart],
  template: `
    <tx-scatter-chart
      id="main"
      [series]="series()"
      [trendLine]="trend()"
      xAxisTitle="Height"
      yAxisTitle="Weight"
      [pt]="{ point: { class: 'own-point' } }"
      (pointClick)="clicks.push($event)"
    />
    <tx-scatter-chart id="bubble" [series]="bubbles" sizeLabel="Population" />
    <tx-scatter-chart id="time" xType="time" [series]="[{ name: 'Deploys', data: [{ x: '2026-01-05', y: 3 }, { x: '2026-03-10', y: 8 }] }]" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly series = signal<TxScatterSeries[]>([
    { name: 'Group A', data: [{ x: 160, y: 55 }, { x: 172, y: 68, label: 'Max' }, [181, 80], { x: 168, y: null }] },
    { name: 'Group B', data: [[150, 48], [158, 52], [165, 60]], color: 'red' },
  ]);
  readonly trend = signal(false);
  readonly bubbles: TxScatterSeries[] = [
    { name: 'Cities', data: [{ x: 1, y: 2, size: 100 }, { x: 2, y: 3, size: 25 }, { x: 3, y: 1 }] },
  ];
  readonly clicks: TxScatterChartPointEvent[] = [];
}

describe('scatter layout', () => {
  it('reads objects and tuples and drops empty values', () => {
    const [points] = scatterData([{ name: 'A', data: [{ x: 1, y: 2, label: 'a' }, [3, 4, 9], { x: 'bad', y: 1 }, { x: 5, y: null }] }]);
    expect(points.map((point) => [point.index, point.x, point.y, point.size, point.label])).toEqual([
      [0, 1, 2, null, 'a'],
      [1, 3, 4, 9, null],
    ]);
  });

  it('sizes bubbles by area and fits a trend line', () => {
    expect(bubbleRadius(100, 100, 4, 20)).toBe(20);
    expect(bubbleRadius(25, 100, 4, 20)).toBe(10);
    expect(bubbleRadius(0.1, 100, 4, 20)).toBe(4);
    expect(bubbleRadius(null, 100, 4, 20)).toBe(4);
    expect(linearTrend([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }])).toEqual({ slope: 2, intercept: 1, from: 0, to: 2 });
    expect(linearTrend([{ x: 1, y: 1 }, { x: 1, y: 2 }])).toBeNull();
  });

  it('finds the nearest dot within its radius and the slack', () => {
    const dots = [
      { cx: 10, cy: 10, r: 4 },
      { cx: 40, cy: 10, r: 20 },
    ];
    expect(nearestDot(dots, 12, 12, 8)).toBe(dots[0]);
    expect(nearestDot(dots, 60, 10, 8)).toBe(dots[1]);
    expect(nearestDot(dots, 10, 60, 8)).toBeNull();
  });
});

describe('TxScatterChart', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('#main .tx-chart-frame__plot');
  const key = (name: string) => plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('draws one dot per value on linear axes', () => {
    const dots = all('#main .tx-scatter-chart__point');
    expect(dots).toHaveLength(6);
    expect(dots[0].classList).toContain('own-point');
    expect(dots[0].getAttribute('r')).toBe('5');
    expect(dots[3].style.getPropertyValue('--tx-scatter-chart-color')).toBe('red');
    expect(el('#main .tx-chart-axes__axis[data-position="bottom"]').textContent).toContain('Height');
    expect(plot().getAttribute('aria-label')).toBe('Scatter chart, 2 series, 6 values, from 48 to 80');
  });

  it('draws bubbles by size, the biggest first', () => {
    const dots = all('#bubble .tx-scatter-chart__point');
    expect(el('#bubble').classList).toContain('tx-scatter-chart--bubble');
    expect(dots.map((dot) => Number(dot.getAttribute('r')))).toEqual([26, 13, 4]);
    expect(el('#bubble .tx-chart-frame__plot').getAttribute('aria-label')).toContain('Bubble chart');
  });

  it('puts dates on a time axis', () => {
    expect(all('#time .tx-scatter-chart__point')).toHaveLength(2);
    expect(el('#time .tx-chart-axes__axis[data-position="bottom"]').textContent).toMatch(/Feb|Mar/);
  });

  it('adds a trend line per series', async () => {
    fixture.componentInstance.trend.set(true);
    await fixture.whenStable();
    expect(all('#main .tx-scatter-chart__trend')).toHaveLength(2);
  });

  it('walks the points by x with the arrows and switches series', async () => {
    key('ArrowRight');
    await fixture.whenStable();
    const panel = () => document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel().textContent).toContain('Group A');
    expect(panel().textContent).toContain('160');
    expect(el('#main .tx-scatter-chart__point--active').getAttribute('data-series')).toBe('0');
    expect(all('#main .tx-scatter-chart__guide')).toHaveLength(2);
    key('ArrowRight');
    await fixture.whenStable();
    expect(panel().textContent).toContain('Max');
    key('ArrowDown');
    await fixture.whenStable();
    expect(panel().textContent).toContain('Group B');
    expect(panel().textContent).toContain('165');
    key('Escape');
    await fixture.whenStable();
    expect(el('#main').classList).not.toContain('tx-scatter-chart--active');
  });

  it('shows the size in the bubble tooltip', async () => {
    el('#bubble .tx-chart-frame__plot').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Population');
    expect(panel.textContent).toContain('100');
  });

  it('reports the clicked point', () => {
    const dot = all('#main .tx-scatter-chart__point').find((item) => item.getAttribute('data-series') === '0' && item.getAttribute('data-index') === '1') as HTMLElement;
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(dot.getAttribute('cx')) + 1, clientY: Number(dot.getAttribute('cy')), bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toEqual({ seriesIndex: 0, dataPointIndex: 1, x: 172, y: 68, size: null, label: 'Max' });
  });

  it('hides a series from the legend', async () => {
    all('#main .tx-chart-legend__item')[1].click();
    await fixture.whenStable();
    expect(all('#main .tx-scatter-chart__point')).toHaveLength(3);
  });
});
