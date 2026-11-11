import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxRadarChart } from './radar-chart.component';
import { TxRadarChartPointEvent, TxRadarChartShape } from './radar-chart.types';
import { radarAngle, radarAxes, radarAxisAt, radarFit, radarPoints, radarPolygonPath, radarShapePath } from './radar-layout';

@Component({
  imports: [TxRadarChart],
  template: `
    <tx-radar-chart
      id="main"
      [series]="series()"
      [categories]="['Speed', 'Power', 'Range', 'Comfort', 'Price']"
      [shape]="shape()"
      [max]="max()"
      [pt]="{ area: { class: 'own-area' } }"
      (pointClick)="clicks.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly series = signal<TxChartSeries[]>([
    { name: 'Model A', data: [80, 60, 70, 50, 90] },
    { name: 'Model B', data: [55, 85, null, 75, 40] },
  ]);
  readonly shape = signal<TxRadarChartShape>('polygon');
  readonly max = signal<number | undefined>(undefined);
  readonly clicks: TxRadarChartPointEvent[] = [];
}

describe('radar layout', () => {
  const fit = { cx: 100, cy: 100, radius: 50 };

  it('spreads the axes clockwise from the top and places their labels outside', () => {
    expect(radarAngle(1, 4)).toBeCloseTo(Math.PI / 2);
    const axes = radarAxes(['N', 'E', 'S', 'W'], fit, 10);
    expect(axes.map((axis) => [axis.x, axis.y])).toEqual([
      [100, 50],
      [150, 100],
      [100, 150],
      [50, 100],
    ]);
    expect(axes.map((axis) => [axis.anchor, axis.baseline])).toEqual([
      ['middle', 'auto'],
      ['start', 'middle'],
      ['middle', 'hanging'],
      ['end', 'middle'],
    ]);
    expect(axes[1].labelX).toBe(160);
  });

  it('keeps long labels inside the box', () => {
    const narrow = radarFit(300, 300, ['A', 'A very long axis label', 'C'], 12, 10);
    const wide = radarFit(300, 300, ['A', 'B', 'C'], 12, 10);
    expect(narrow.radius).toBeLessThan(wide.radius);
    expect(wide.radius).toBeLessThan(150);
  });

  it('maps values to points and draws polygons, circles and gaps', () => {
    const points = radarPoints([10, null, 5, 0], [0, 10], fit);
    expect(points[0]).toEqual({ index: 0, x: 100, y: 50 });
    expect(points[1]).toBeNull();
    expect(points[2]).toEqual({ index: 2, x: 100, y: 125 });
    expect(radarPolygonPath(points, fit)).toBe('M100,50L100,100L100,125L100,100Z');
    expect(radarShapePath(fit, 50, 4, 'polygon')).toBe('M100,50L150,100L100,150L50,100Z');
    expect(radarShapePath(fit, 50, 4, 'circle')).toContain('a50,50');
  });

  it('finds the axis under the pointer', () => {
    expect(radarAxisAt(100, 60, fit, 4, 10)).toBe(0);
    expect(radarAxisAt(140, 98, fit, 4, 10)).toBe(1);
    expect(radarAxisAt(100, 170, fit, 4, 10)).toBe(-1);
  });
});

describe('TxRadarChart', () => {
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

  it('draws axes, rings and one filled polygon per series', () => {
    expect(all('#main .tx-radar-chart__axis-line')).toHaveLength(5);
    expect(all('#main .tx-radar-chart__label').map((label) => label.textContent?.trim())).toEqual(['Speed', 'Power', 'Range', 'Comfort', 'Price']);
    expect(all('#main .tx-radar-chart__ring').length).toBeGreaterThan(2);
    expect(all('#main .tx-radar-chart__area')).toHaveLength(2);
    expect(el('#main .tx-radar-chart__area').classList).toContain('own-area');
    expect(all('#main .tx-radar-chart__point')).toHaveLength(9);
    expect(plot().getAttribute('aria-label')).toBe('Radar chart, 2 series, 5 values, from 40 to 90');
  });

  it('draws circular rings and takes a fixed maximum', async () => {
    fixture.componentInstance.shape.set('circle');
    fixture.componentInstance.max.set(200);
    await fixture.whenStable();
    expect(el('#main .tx-radar-chart__ring').getAttribute('d')).toContain('a');
    expect(all('#main .tx-radar-chart__tick').map((tick) => tick.textContent?.trim())).toContain('200');
  });

  it('reads the axes with the keyboard and lists every series in the tooltip', async () => {
    key('ArrowRight');
    await fixture.whenStable();
    expect(el('#main').classList).toContain('tx-radar-chart--active');
    expect(el('#main .tx-radar-chart__label--active').textContent?.trim()).toBe('Speed');
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Model A');
    expect(panel.textContent).toContain('55');
    key('ArrowRight');
    key('ArrowRight');
    await fixture.whenStable();
    expect(all('#main .tx-radar-chart__marker')).toHaveLength(1);
    key('ArrowDown');
    await fixture.whenStable();
    expect(el('#main .tx-radar-chart__series--current').getAttribute('data-series')).toBe('1');
    key('Escape');
    await fixture.whenStable();
    expect(el('#main').classList).not.toContain('tx-radar-chart--active');
  });

  it('reports a click on an axis with the nearest series', () => {
    const point = all('#main .tx-radar-chart__series[data-series="1"] .tx-radar-chart__point')[1];
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(point.getAttribute('cx')), clientY: Number(point.getAttribute('cy')), bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toMatchObject({ seriesIndex: 1, dataPointIndex: 1, value: 85, category: 'Power' });
  });

  it('hides a series from the legend', async () => {
    all('#main .tx-chart-legend__item')[0].click();
    await fixture.whenStable();
    expect(all('#main .tx-radar-chart__area')).toHaveLength(1);
  });
});
