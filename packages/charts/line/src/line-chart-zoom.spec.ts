import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxChartAnnotation, TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from './line-chart.component';
import { TxLineChartPointEvent } from './line-chart.types';

const months = Array.from({ length: 20 }, (_, index) => `M${index + 1}`);

@Component({
  imports: [TxLineChart],
  template: `
    <tx-line-chart
      id="zoom"
      [series]="series"
      [categories]="months"
      zoom
      brush
      [(xRange)]="range"
      [annotations]="annotations"
      [height]="360"
      (pointClick)="clicks.push($event)"
    />
    <tx-line-chart id="live" [series]="live()" [categories]="liveLabels()" [maxPoints]="5" live [height]="240" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly months = months;
  readonly series: TxChartSeries[] = [{ name: 'Visits', data: months.map((_, index) => 10 + index * 3) }];
  readonly range = signal<readonly [number, number] | null>(null);
  readonly annotations: TxChartAnnotation[] = [
    { type: 'x-line', x: 'M5', label: 'Launch' },
    { type: 'y-line', y: 40, label: 'Goal', tone: 'success' },
    { type: 'x-band', from: 'M10', to: 'M12', label: 'Sale' },
    { type: 'point', x: 'M18', y: 61, label: 'Peak' },
  ];
  readonly live = signal<TxChartSeries[]>([{ name: 'Load', data: [1, 2, 3, 4, 5, 6, 7] }]);
  readonly liveLabels = signal(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
  readonly clicks: TxLineChartPointEvent[] = [];
}

describe('TxLineChart zoom, brush, annotations and live', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('#zoom .tx-chart-frame__plot');
  const pointer = (type: string, x: number, y: number, buttons = 1) =>
    plot().dispatchEvent(Object.assign(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, buttons }), { pointerType: 'mouse', pointerId: 1 }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('draws annotations behind and over the series', () => {
    expect(all('#zoom .tx-chart-annotation__line')).toHaveLength(2);
    expect(all('#zoom .tx-chart-annotation__band')).toHaveLength(1);
    expect(all('#zoom .tx-chart-annotation__point')).toHaveLength(1);
    expect(all('#zoom .tx-chart-annotation__label').map((label) => label.textContent?.trim())).toEqual(['Launch', 'Goal', 'Sale', 'Peak']);
  });

  it('zooms at the pointer with Ctrl and the wheel, keeps annotations on their data and resets', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await fixture.whenStable();
    plot().dispatchEvent(new WheelEvent('wheel', { deltaY: -400, ctrlKey: true, clientX: 320, clientY: 100, bubbles: true, cancelable: true }));
    await fixture.whenStable();
    const range = fixture.componentInstance.range();
    expect(range).not.toBeNull();
    expect((range?.[1] ?? 0) - (range?.[0] ?? 0)).toBeLessThan(19);
    expect(all('#zoom .tx-line-chart__point, #zoom .tx-chart-axes__axis[data-position="bottom"] .tx-chart-axes__label').length).toBeGreaterThan(0);
    expect(el('#zoom .tx-chart-frame__reset')).not.toBeNull();
    expect(el('#zoom .tx-line-chart__layer').getAttribute('clip-path')).toContain('url(#');
    expect(el('#zoom').classList).not.toContain('tx-line-chart--active');
    expect(document.querySelector('.tx-chart-frame__tooltip')).toBeNull();
    el('#zoom .tx-chart-frame__reset').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.range()).toBeNull();
    expect(el('#zoom .tx-chart-frame__reset')).toBeNull();
  });

  it('zooms with + and − and pans with Shift and the arrows', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
    await fixture.whenStable();
    const zoomed = fixture.componentInstance.range();
    expect(zoomed).not.toBeNull();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.range()?.[0]).toBeGreaterThan(zoomed?.[0] ?? 0);
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.range()).toBeNull();
  });

  it('pans a zoomed chart by dragging and reports clicks with the full index', async () => {
    fixture.componentInstance.range.set([8, 14]);
    await fixture.whenStable();
    const labels = () => all('#zoom .tx-chart-axes__axis[data-position="bottom"] .tx-chart-axes__label').map((label) => label.textContent?.trim());
    expect(labels()[0]).toBe('M9');
    pointer('pointerdown', 300, 100);
    pointer('pointermove', 200, 100);
    pointer('pointerup', 200, 100, 0);
    plot().dispatchEvent(new MouseEvent('click', { clientX: 200, clientY: 100, bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.clicks).toHaveLength(0);
    expect(fixture.componentInstance.range()?.[0]).toBeGreaterThan(8);
    fixture.componentInstance.range.set([8, 14]);
    await fixture.whenStable();
    pointer('pointermove', 60, 100, 0);
    plot().dispatchEvent(new MouseEvent('click', { clientX: 60, clientY: 100, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]?.dataPointIndex).toBeGreaterThanOrEqual(8);
  });

  it('draws the overview strip and moves the window from it', async () => {
    expect(el('#zoom .tx-line-chart__overview-line')).not.toBeNull();
    fixture.componentInstance.range.set([0, 5]);
    await fixture.whenStable();
    const window = el('#zoom .tx-line-chart__overview-window');
    const top = Number(window.getAttribute('y')) + 10;
    const x = Number(window.getAttribute('x')) + Number(window.getAttribute('width')) / 2;
    pointer('pointerdown', x, top);
    pointer('pointermove', x + 120, top);
    pointer('pointerup', x + 120, top, 0);
    await fixture.whenStable();
    expect(fixture.componentInstance.range()?.[0]).toBeGreaterThan(2);
  });

  it('keeps the last points of a live series', () => {
    expect(all('#live .tx-chart-axes__axis[data-position="bottom"] .tx-chart-axes__label').map((label) => label.textContent?.trim())).toEqual(['c', 'd', 'e', 'f', 'g']);
    expect(el('#live').classList).toContain('tx-line-chart--live');
  });
});
