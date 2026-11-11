import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxChartSeries, bandScale, linearScale, stackValues } from '@tectra-ng/charts/core';
import { TxColumnChart } from './column-chart.component';
import { TxColumnChartPointEvent } from './column-chart.types';
import { columnBars } from './column-layout';

@Component({
  imports: [TxColumnChart],
  template: `
    <tx-column-chart
      id="main"
      [series]="series()"
      [categories]="['Mon', 'Tue', 'Wed']"
      [stacked]="stacked()"
      [stackType]="stackType()"
      [horizontal]="horizontal()"
      [dataLabels]="labels()"
      [pt]="{ bar: { class: 'own-bar' } }"
      (barClick)="clicks.push($event)"
    />
    <tx-column-chart id="negative" [series]="[{ name: 'Flow', data: [5, -3] }]" [categories]="['A', 'B']" />
    <tx-column-chart id="fill" height="100%" [series]="[{ name: 'A', data: [1] }]" [categories]="['A']" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly series = signal<TxChartSeries[]>([
    { name: 'Opened', data: [4, 5, 3] },
    { name: 'Closed', data: [2, null, 1] },
  ]);
  readonly stacked = signal(true);
  readonly stackType = signal<'normal' | '100%'>('normal');
  readonly horizontal = signal(false);
  readonly labels = signal(false);
  readonly clicks: TxColumnChartPointEvent[] = [];
}

describe('columnBars', () => {
  it('stacks bars and rounds only the outer end', () => {
    const values = [
      [4, -2],
      [3, -1],
    ];
    const bars = columnBars({
      band: bandScale(2, [0, 200]),
      value: linearScale([-4, 8], [120, 0]),
      horizontal: false,
      stacked: true,
      widthRatio: 0.5,
      groupGap: 2,
      values,
      stackedValues: stackValues(values),
      visible: [0, 1],
      colors: [],
      labels: (value) => String(value),
      labelFontSize: 11,
    });
    expect(bars).toHaveLength(4);
    expect(bars.map((bar) => bar.end)).toEqual([null, null, 'top', 'bottom']);
    expect(bars[0].width).toBe(50);
    expect(bars[0].x).toBe(25);
    expect(bars[0].label).toBe('4');
  });

  it('groups bars side by side', () => {
    const bars = columnBars({
      band: bandScale(1, [0, 100]),
      value: linearScale([0, 10], [100, 0]),
      horizontal: true,
      stacked: false,
      widthRatio: 1,
      groupGap: 0,
      values: [[5], [10]],
      stackedValues: [],
      visible: [0, 1],
      colors: ['red'],
      labels: null,
      labelFontSize: 11,
    });
    expect(bars.map((bar) => [bar.y, bar.height, bar.end, bar.color])).toEqual([
      [0, 50, 'right', 'red'],
      [50, 50, 'right', 'var(--tx-chart-series-color2)'],
    ]);
  });
});

describe('TxColumnChart', () => {
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

  it('stacks the series by default', () => {
    const bars = all('#main .tx-column-chart__bar');
    expect(bars).toHaveLength(5);
    expect(bars.filter((bar) => bar.getAttribute('data-end') === 'top').map((bar) => bar.getAttribute('data-index'))).toEqual(['1', '0', '2']);
    expect(bars[0].classList).toContain('own-bar');
    expect(plot().getAttribute('aria-label')).toBe('Column chart, 2 series, 3 values, from 1 to 5');
  });

  it('groups, turns horizontal and writes data labels', async () => {
    fixture.componentInstance.stacked.set(false);
    fixture.componentInstance.labels.set(true);
    await fixture.whenStable();
    const bars = all('#main .tx-column-chart__bar');
    expect(bars.every((bar) => bar.getAttribute('data-end') === 'top')).toBe(true);
    expect(all('#main .tx-column-chart__label').map((label) => label.textContent?.trim())).toContain('5');
    fixture.componentInstance.horizontal.set(true);
    await fixture.whenStable();
    expect(el('#main').getAttribute('data-orientation')).toBe('horizontal');
    expect(el('#main .tx-column-chart__bar').getAttribute('data-end')).toBe('right');
    expect(el('#main .tx-chart-axes__axis[data-position="left"]').textContent).toContain('Mon');
  });

  it('shows 100% stacks in percent', async () => {
    fixture.componentInstance.stackType.set('100%');
    await fixture.whenStable();
    expect(el('#main .tx-chart-axes__axis[data-position="left"]').textContent).toContain('100%');
  });

  it('grows negative bars down from the zero line', () => {
    expect(el('#negative .tx-chart-axes__zero')).not.toBeNull();
    expect(all('#negative .tx-column-chart__bar').map((bar) => bar.getAttribute('data-end'))).toEqual(['top', 'bottom']);
  });

  it('fills its parent with a string height', () => {
    expect(el('#fill').classList).toContain('tx-column-chart--fill');
    expect(el('#fill .tx-chart-frame').style.height).toBe('100%');
  });

  it('reads the columns with the keyboard and pins the tooltip above the column', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).toContain('tx-column-chart--active');
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Mon');
    expect(panel.getAttribute('data-side')).toMatch(/^(top|bottom|left|right)$/);
    expect(panel.querySelector('.tx-chart-frame__tooltip-total')?.textContent).toContain('6');
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(all('#main .tx-column-chart__bar--active')).toHaveLength(2);
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).not.toContain('tx-column-chart--active');
  });

  it('reacts anywhere in the category and lays a band under it', async () => {
    plot().dispatchEvent(new MouseEvent('pointermove', { clientX: 5, clientY: 20, bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).not.toContain('tx-column-chart--active');
    expect(el('#main .tx-chart-hover-band')).toBeNull();
    const bar = all('#main .tx-column-chart__bar').find((item) => item.getAttribute('data-index') === '1') as HTMLElement;
    const center = Number(bar.getAttribute('x')) + Number(bar.getAttribute('width')) / 2;
    plot().dispatchEvent(new MouseEvent('pointermove', { clientX: center, clientY: Number(bar.getAttribute('y')) - 30, bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).toContain('tx-column-chart--active');
    const band = el('#main .tx-chart-hover-band');
    expect(band.classList).toContain('tx-chart-hover-band--on');
    expect(Number(band.getAttribute('x'))).toBeLessThan(Number(bar.getAttribute('x')));
    expect(Number(band.getAttribute('x')) + Number(band.getAttribute('width'))).toBeGreaterThan(Number(bar.getAttribute('x')) + Number(bar.getAttribute('width')));
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(el('#main .tx-chart-hover-band').classList).not.toContain('tx-chart-hover-band--on');
  });

  it('reports the clicked bar', async () => {
    const bar = all('#main .tx-column-chart__bar').find((item) => item.getAttribute('data-index') === '1') as SVGRectElement & HTMLElement;
    const x = Number(bar.getAttribute('x')) + 2;
    const y = Number(bar.getAttribute('y')) + 2;
    plot().dispatchEvent(new MouseEvent('click', { clientX: x, clientY: y, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toMatchObject({ seriesIndex: 0, dataPointIndex: 1, value: 5, category: 'Tue' });
  });

  it('hides a series from the legend', async () => {
    all('#main .tx-chart-legend__item')[1].click();
    await fixture.whenStable();
    expect(all('#main .tx-column-chart__bar')).toHaveLength(3);
  });
});
