import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { bandScale, linearScale } from '@tectra-ng/charts/core';
import { TxComboChart } from './combo-chart.component';
import { TxComboChartPointEvent, TxComboChartSeries } from './combo-chart.types';
import { comboBars, comboSlots } from './combo-layout';

@Component({
  imports: [TxComboChart],
  template: `
    <tx-combo-chart
      id="main"
      [series]="series()"
      [categories]="['Jan', 'Feb', 'Mar']"
      [stacked]="stacked()"
      y2ValueFormat="percent"
      y2AxisTitle="Margin"
      [pt]="{ bar: { class: 'own-bar' }, line: { class: 'own-line' } }"
      (pointClick)="clicks.push($event)"
    />
    <tx-combo-chart id="single" [series]="[{ name: 'Visits', data: [3, 4], type: 'area' }]" [categories]="['A', 'B']" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly series = signal<TxComboChartSeries[]>([
    { name: 'Revenue', data: [40, 52, 61] },
    { name: 'Costs', data: [28, 30, 35] },
    { name: 'Margin', data: [30, 42, 43], type: 'line', axis: 'secondary' },
  ]);
  readonly stacked = signal(false);
  readonly clicks: TxComboChartPointEvent[] = [];
}

describe('comboBars', () => {
  it('gives every column series its own slot, or one slot per axis when stacked', () => {
    expect([...comboSlots([0, 2, 3], [0, 0, 1, 1], false).entries()]).toEqual([
      [0, 0],
      [2, 1],
      [3, 2],
    ]);
    expect([...comboSlots([0, 2, 3], [0, 0, 1, 0], true).entries()]).toEqual([
      [0, 0],
      [2, 1],
      [3, 0],
    ]);
  });

  it('maps each bar with the scale of its axis', () => {
    const bars = comboBars({
      band: bandScale(1, [0, 100]),
      scales: [linearScale([0, 10], [100, 0]), linearScale([0, 1000], [100, 0])],
      axes: [0, 1],
      stacked: false,
      widthRatio: 1,
      groupGap: 0,
      values: [[5], [500]],
      stackedValues: [],
      columns: [0, 1],
      colors: [],
    });
    expect(bars.map((bar) => [bar.x, bar.y, bar.width, bar.height, bar.end])).toEqual([
      [0, 50, 50, 50, 'top'],
      [50, 50, 50, 50, 'top'],
    ]);
  });
});

describe('TxComboChart', () => {
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

  it('draws grouped columns and a line on a second axis', () => {
    expect(all('#main .tx-combo-chart__bar')).toHaveLength(6);
    expect(all('#main .tx-combo-chart__bar')[0].classList).toContain('own-bar');
    expect(all('#main .tx-combo-chart__line')).toHaveLength(1);
    expect(el('#main .tx-combo-chart__line').classList).toContain('own-line');
    expect(all('#main .tx-combo-chart__point')).toHaveLength(3);
    const right = el('#main .tx-chart-axes__axis[data-position="right"]');
    expect(right.textContent).toContain('%');
    expect(right.textContent).toContain('Margin');
    expect(all('#main .tx-chart-axes__axis[data-position="left"] .tx-chart-axes__label')).toHaveLength(
      all('#main .tx-chart-axes__axis[data-position="right"] .tx-chart-axes__label').length,
    );
    expect(plot().getAttribute('aria-label')).toBe('Combo chart, 3 series, 3 values');
  });

  it('marks line series with a line in the legend', () => {
    expect(all('#main .tx-chart-legend__item').map((item) => item.getAttribute('data-marker'))).toEqual(['dot', 'dot', 'line']);
  });

  it('stacks the columns', async () => {
    fixture.componentInstance.stacked.set(true);
    await fixture.whenStable();
    expect(el('#main').classList).toContain('tx-combo-chart--stacked');
    expect(all('#main .tx-combo-chart__bar').filter((bar) => bar.getAttribute('data-end') === 'top')).toHaveLength(3);
    const first = all('#main .tx-combo-chart__bar').filter((bar) => bar.getAttribute('data-index') === '0');
    expect(first[0].getAttribute('x')).toBe(first[1].getAttribute('x'));
  });

  it('reads the categories with the keyboard and formats every series by its axis', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).toContain('tx-combo-chart--active');
    expect(all('#main .tx-combo-chart__bar--active')).toHaveLength(2);
    expect(el('#main .tx-chart-hover-band--on')).not.toBeNull();
    expect(all('#main .tx-combo-chart__marker')).toHaveLength(1);
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Jan');
    expect(panel.textContent).toContain('30%');
    expect(panel.textContent).toContain('40');
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).not.toContain('tx-combo-chart--active');
  });

  it('reports the clicked column', async () => {
    const bar = all('#main .tx-combo-chart__bar').find((item) => item.getAttribute('data-index') === '1' && item.getAttribute('data-series') === '0') as HTMLElement;
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(bar.getAttribute('x')) + 1, clientY: Number(bar.getAttribute('y')) + Number(bar.getAttribute('height')) - 1, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toMatchObject({ seriesIndex: 0, dataPointIndex: 1, value: 52, category: 'Feb' });
  });

  it('hides a series from the legend and drops the second axis with it', async () => {
    all('#main .tx-chart-legend__item')[2].click();
    await fixture.whenStable();
    expect(all('#main .tx-combo-chart__line')).toHaveLength(0);
    all('#main .tx-chart-legend__item')[0].click();
    await fixture.whenStable();
    expect(all('#main .tx-combo-chart__bar')).toHaveLength(3);
  });

  it('draws an area series on its own without a legend', () => {
    expect(all('#single .tx-combo-chart__area')).toHaveLength(1);
    expect(all('#single .tx-chart-legend__item')).toHaveLength(0);
    expect(el('#single .tx-chart-axes__axis[data-position="right"]')).toBeNull();
  });
});
