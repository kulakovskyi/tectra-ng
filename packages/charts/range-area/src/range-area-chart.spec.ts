import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxRangeAreaChart } from './range-area-chart.component';
import { TxRangeAreaPointEvent, TxRangeSeries } from './range-area-chart.types';

@Component({
  imports: [TxRangeAreaChart],
  template: `
    <tx-range-area-chart id="main" [series]="series()" [categories]="['Mon', 'Tue', 'Wed', 'Thu', 'Fri']" [edges]="edges()" [pt]="{ band: { class: 'own-band' } }" (pointClick)="clicks.push($event)" />
    <tx-range-area-chart id="time" xType="time" [series]="[{ name: 'Temp', low: [1, 2], high: [5, 7] }]" [categories]="['2026-01-01', '2026-03-01']" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly series = signal<TxRangeSeries[]>([
    { name: 'Kyiv', low: [2, 4, null, 5, 3], high: [9, 11, null, 12, 10], line: [6, 7, null, 8, 6] },
    { name: 'Lviv', low: [0, 1, 2, 3, 2], high: [6, 8, 9, 7, 6] },
  ]);
  readonly edges = signal(true);
  readonly clicks: TxRangeAreaPointEvent[] = [];
}

describe('TxRangeAreaChart', () => {
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

  it('draws a band per series with its edges, a line where given and gaps for nulls', () => {
    const bands = all('#main .tx-range-area-chart__band');
    expect(bands).toHaveLength(2);
    expect(bands[0].classList).toContain('own-band');
    expect(bands[0].getAttribute('d')?.match(/M/g)?.length).toBe(2);
    expect(all('#main .tx-range-area-chart__edge')).toHaveLength(4);
    expect(all('#main .tx-range-area-chart__line')).toHaveLength(1);
    expect(plot().getAttribute('aria-label')).toBe('Range area chart, 2 series, 5 values, from 0 to 12');
  });

  it('drops the edges', async () => {
    fixture.componentInstance.edges.set(false);
    await fixture.whenStable();
    expect(all('#main .tx-range-area-chart__edge')).toHaveLength(0);
  });

  it('puts dates on a time axis', () => {
    expect(el('#time .tx-chart-axes__axis[data-position="bottom"]').textContent).toMatch(/Jan|Feb|Mar/);
  });

  it('shows the line and the range of every series in the tooltip', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Tue');
    expect(panel.textContent).toContain('7');
    expect(panel.textContent).toContain('4 – 11');
    expect(panel.textContent).toContain('1 – 8');
    expect(all('#main .tx-range-area-chart__marker')).toHaveLength(5);
    expect(all('#main .tx-range-area-chart__crosshair')).toHaveLength(1);
  });

  it('reports a click with the series whose band is under the pointer', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    for (let step = 0; step < 3; step++) plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    const line = el('#main .tx-range-area-chart__crosshair');
    const marker = all('#main .tx-range-area-chart__marker')[0];
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(line.getAttribute('x1')), clientY: Number(marker.getAttribute('cy')), bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toMatchObject({ seriesIndex: 0, dataPointIndex: 3, category: 'Thu', low: 5, high: 12, line: 8 });
  });
});
