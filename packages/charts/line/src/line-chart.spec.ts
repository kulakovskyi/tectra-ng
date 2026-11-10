import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxChartSeries, TxChartTooltipTemplate } from '@tectra-ng/charts/core';
import { TxLineChart } from './line-chart.component';
import { TxLineChartCurve, TxLineChartPointEvent, TxLineChartSeriesToggle } from './line-chart.types';

@Component({
  imports: [TxLineChart, TxChartTooltipTemplate],
  template: `
    <tx-line-chart
      id="main"
      [series]="series()"
      [categories]="categories()"
      [curve]="curve()"
      [stacked]="stacked()"
      [stackType]="stackType()"
      [height]="320"
      [markers]="markers()"
      [loading]="loading()"
      ariaLabel="Traffic"
      [dt]="{ line: { strokeWidth: '4' } }"
      [pt]="{ line: { class: 'own-line' } }"
      (pointClick)="clicks.push($event)"
      (seriesToggle)="toggles.push($event)"
    />
    <tx-line-chart id="plain" [series]="[{ name: 'A', data: [1, 2] }]" [categories]="['x', 'y']" unstyled />
    <tx-line-chart id="months" [series]="[{ name: 'A', data: [1, 2, 3] }]" />
    <tx-line-chart id="time" xType="time" [series]="timeSeries" />
    <tx-line-chart id="long" [series]="long" [area]="false" />
    <tx-line-chart id="custom" [series]="series()" [categories]="categories()">
      <ng-template txChartTooltip let-data>
        <span class="own-tip">{{ data.title }} / {{ data.rows.length }}</span>
      </ng-template>
    </tx-line-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly series = signal<TxChartSeries[]>([
    { name: 'Visits', data: [10, 20, null, 40] },
    { name: 'Sign-ups', data: [5, 8, 6, 12], color: 'red' },
  ]);
  readonly categories = signal(['Mon', 'Tue', 'Wed', 'Thu']);
  readonly curve = signal<TxLineChartCurve>('smooth');
  readonly stacked = signal(false);
  readonly stackType = signal<'normal' | '100%'>('normal');
  readonly markers = signal(false);
  readonly loading = signal(false);
  readonly timeSeries: TxChartSeries[] = [
    {
      name: 'Orders',
      data: [
        { x: '2026-01-01', y: 1 },
        { x: '2026-01-02', y: 2 },
        { x: '2026-03-01', y: 3 },
      ],
    },
  ];
  readonly long: TxChartSeries[] = [{ name: 'Long', data: Array.from({ length: 5000 }, (_, index) => Math.sin(index / 50)) }];
  readonly clicks: TxLineChartPointEvent[] = [];
  readonly toggles: TxLineChartSeriesToggle[] = [];
}

describe('TxLineChart', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = (id = 'main') => el(`#${id} .tx-chart-frame__plot`);
  const key = async (name: string, id = 'main') => {
    plot(id).dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('draws a line and an area per series with gaps for null', () => {
    const lines = all('#main .tx-line-chart__line');
    expect(lines).toHaveLength(2);
    expect(lines[0].getAttribute('d')?.match(/M/g)).toHaveLength(2);
    expect(all('#main .tx-line-chart__area')).toHaveLength(2);
    expect(lines[1].style.stroke).toBe('red');
    expect(lines[0].style.stroke).toBe('var(--tx-chart-series-color1)');
    expect(all('#main linearGradient')).toHaveLength(2);
    expect(lines[0].classList).toContain('own-line');
  });

  it('applies tokens, styles and unstyled', () => {
    const host = el('#main');
    expect(host.style.getPropertyValue('--tx-chart-line-stroke-width')).toBe('4');
    expect(host.hasAttribute('data-styled')).toBe(true);
    expect(el('#plain').hasAttribute('data-styled')).toBe(false);
    expect(el('#plain .tx-chart-frame').hasAttribute('data-styled')).toBe(false);
  });

  it('switches curves and markers', async () => {
    fixture.componentInstance.curve.set('straight');
    fixture.componentInstance.markers.set(true);
    await fixture.whenStable();
    expect(el('#main .tx-line-chart__line').getAttribute('d')).not.toContain('C');
    expect(all('#main .tx-line-chart__point').length).toBe(7);
    fixture.componentInstance.curve.set('step');
    await fixture.whenStable();
    expect(el('#main .tx-line-chart__line').getAttribute('d')).toContain('H');
  });

  it('labels the axes and writes a summary and a data table', () => {
    const labels = all('#main .tx-chart-axes__label').map((label) => label.textContent?.trim());
    expect(labels).toContain('Mon');
    expect(labels).toContain('Thu');
    expect(plot().getAttribute('aria-label')).toBe('Traffic. Area chart, 2 series, 4 values, from 5 to 40');
    expect(all('#main tbody tr')).toHaveLength(4);
    expect(all('#main tbody tr')[2].textContent).toContain('—');
  });

  it('uses the month names of the locale without categories', () => {
    const months = all('#months tbody th').map((cell) => cell.textContent);
    expect(months).toHaveLength(12);
    expect(months.slice(0, 3)).toEqual(['January', 'February', 'March']);
  });

  it('puts dates on a time axis with real gaps', () => {
    const points = all('#time tbody th').map((cell) => cell.textContent);
    expect(points[0]).toContain('2026');
    const line = el('#time .tx-line-chart__line').getAttribute('d') ?? '';
    const xs = [...line.matchAll(/([\d.]+),[\d.]+/g)].map((match) => Number(match[1]));
    expect(xs[xs.length - 1] - xs[0]).toBeGreaterThan(0);
  });

  it('thins long series before drawing', () => {
    const line = el('#long .tx-line-chart__line').getAttribute('d') ?? '';
    expect(line.split('C').length - 1).toBeLessThan(2000);
    expect(all('#long tbody tr')).toHaveLength(250);
    expect(all('#long tbody th').pop()?.textContent).toBe('5000');
  });

  it('stacks series and shows 100% stacks in percent', async () => {
    fixture.componentInstance.stackType.set('100%');
    await fixture.whenStable();
    const labels = all('#main .tx-chart-axes__axis[data-position="left"] .tx-chart-axes__label').map((label) => label.textContent?.trim());
    expect(labels[labels.length - 1]).toBe('100%');
    expect(el('#main .tx-line-chart__area--stacked')).not.toBeNull();
  });

  it('hides a series from the legend and keeps its colour', async () => {
    const items = all('#main .tx-chart-legend__item');
    items[0].click();
    await fixture.whenStable();
    expect(all('#main .tx-line-chart__line')).toHaveLength(1);
    expect(el('#main .tx-line-chart__line').style.stroke).toBe('red');
    expect(fixture.componentInstance.toggles).toEqual([{ seriesIndex: 0, name: 'Visits', hidden: true }]);
    items[1].dispatchEvent(new MouseEvent('pointerenter'));
    await fixture.whenStable();
    expect(el('#main').classList).toContain('tx-line-chart--focused');
  });

  it('walks the values with the keyboard, announces them and shows the tooltip', async () => {
    plot().focus();
    await key('ArrowRight');
    let panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Mon');
    expect(panel.textContent).toContain('10');
    expect(all('#main .tx-line-chart__marker')).toHaveLength(2);
    expect(el('#main .tx-line-chart__crosshair')).not.toBeNull();
    await key('End');
    panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Thu');
    await key('ArrowDown');
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(document.querySelector('.cdk-live-announcer-element')?.textContent).toContain('Sign-ups, Thu: 12');
    await key('Escape');
    expect(el('#main .tx-line-chart__crosshair')).toBeNull();
  });

  it('follows the pointer and reports clicks', async () => {
    const target = plot();
    target.dispatchEvent(new MouseEvent('pointermove', { clientX: 620, clientY: 100, bubbles: true }));
    await fixture.whenStable();
    expect((document.querySelector('.tx-chart-frame__tooltip') as HTMLElement).textContent).toContain('Thu');
    target.dispatchEvent(new MouseEvent('click', { clientX: 620, clientY: 100, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toMatchObject({ dataPointIndex: 3, category: 'Thu' });
    target.dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(el('#main .tx-line-chart__crosshair')).toBeNull();
  });

  it('renders a custom tooltip template', async () => {
    plot('custom').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    expect(document.querySelector('.own-tip')?.textContent).toBe('Mon / 2');
  });

  it('shows the skeleton and "No data"', async () => {
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    expect(el('#main tx-skeleton')).not.toBeNull();
    fixture.componentInstance.loading.set(false);
    fixture.componentInstance.series.set([{ name: 'Empty', data: [null, null] }]);
    await fixture.whenStable();
    expect(el('#main .tx-chart-frame__empty').textContent).toContain('No data');
  });
});
