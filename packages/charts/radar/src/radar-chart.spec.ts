import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxAnnouncer } from '@tectra-ng/core/a11y';
import { TxChartLegendVariant, TxChartSeries, TxChartTooltipFormatter } from '@tectra-ng/charts/core';
import { TxRadarChart } from './radar-chart.component';
import { TxRadarChartPointEvent, TxRadarChartSeriesToggle, TxRadarChartShape } from './radar-chart.types';
import { radarAngle, radarAxes, radarAxisAt, radarFit, radarPoints, radarPolygonPath, radarRadius, radarShapePath } from './radar-layout';

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

  it('handles no axes, flat domains, empty shapes and the left half', () => {
    expect(radarAngle(0, 0)).toBe(0);
    expect(radarFit(300, 300, ['N', 'E', 'S', 'W'], 12, 10).radius).toBeLessThan(150);
    expect(radarRadius(5, [5, 5], 10)).toBe(0);
    expect(radarShapePath(fit, 0, 4, 'polygon')).toBe('');
    expect(radarPolygonPath([], fit)).toBe('');
    expect(radarAxisAt(60, 100, fit, 4, 10)).toBe(3);
    expect(radarAxisAt(100, 100, fit, 0, 10)).toBe(-1);
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

@Component({
  imports: [TxRadarChart],
  template: `
    <tx-radar-chart
      style="--tx-chart-radar-label-gap: 20"
      [series]="series()"
      [categories]="categories()"
      [legendVariant]="legendVariant()"
      [tooltipFormatter]="formatter()"
      [ariaLabel]="label()"
      (pointClick)="clicks.push($event)"
      (seriesToggle)="toggles.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InteractiveHost {
  readonly series = signal<TxChartSeries[] | null>([
    { name: 'Model A', data: [80, 60, 70, 50, 90] },
    { name: 'Model B', data: [55, 85, null, 75, 40] },
  ]);
  readonly categories = signal<string[] | null>(['Speed', 'Power', 'Range', 'Comfort', 'Price']);
  readonly legendVariant = signal<TxChartLegendVariant>('dot');
  readonly formatter = signal<TxChartTooltipFormatter | null>(null);
  readonly label = signal('');
  readonly clicks: TxRadarChartPointEvent[] = [];
  readonly toggles: TxRadarChartSeriesToggle[] = [];
}

describe('TxRadarChart interaction', () => {
  let fixture: ComponentFixture<InteractiveHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const host = () => fixture.componentInstance;
  const chart = () => fixture.debugElement.query(By.directive(TxRadarChart)).componentInstance as TxRadarChart;
  const plot = () => el('.tx-chart-frame__plot');
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const pointer = async (type: string, clientX: number, clientY: number) => {
    plot().dispatchEvent(new MouseEvent(type, { clientX, clientY, bubbles: true }));
    await fixture.whenStable();
  };
  const axisPoint = (index: number, share: number) => {
    const { cx, cy, radius } = chart().fit();
    const angle = radarAngle(index, 5);
    return [cx + radius * share * Math.sin(angle), cy - radius * share * Math.cos(angle)] as const;
  };
  const legend = () => all('.tx-chart-legend__item');

  beforeEach(async () => {
    fixture = TestBed.createComponent(InteractiveHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('reads the label gap from its token', () => {
    expect(chart().label().gap).toBe(20);
  });

  it('turns the tooltip toward the axis and formats it with a custom formatter', async () => {
    host().formatter.set((value) => `${value} pts`);
    const sides: string[] = [];
    for (let step = 0; step < 5; step++) {
      await key('ArrowRight');
      sides.push(chart().tooltip()?.placement ?? '');
    }
    expect(sides).toEqual(['top', 'right', 'bottom', 'bottom', 'left']);
    expect(chart().tooltip()?.rows.map((row) => row.value)).toEqual(['90 pts', '40 pts']);
    await key('ArrowUp');
    expect(chart().active()?.series).toBe(1);
  });

  it('shows averages or the active values in a stat legend', async () => {
    const announce = vi.spyOn(TestBed.inject(TxAnnouncer), 'announce');
    host().legendVariant.set('stat');
    host().series.update((list) => [...(list ?? []), { name: 'Model C', data: [null, null, null, null, null] }]);
    await fixture.whenStable();
    expect(chart().legendItems().map((item) => [item.value, item.caption])).toEqual([
      ['70', 'Average'],
      ['63.75', 'Average'],
      ['—', 'Average'],
    ]);
    await key('ArrowRight');
    await key('ArrowRight');
    await key('ArrowRight');
    expect(chart().tooltip()).toBeNull();
    expect(chart().legendItems().map((item) => [item.value, item.caption])).toEqual([
      ['70', 'Range'],
      ['—', 'Range'],
      ['—', 'Range'],
    ]);
    await key('ArrowDown');
    expect(announce).toHaveBeenLastCalledWith('Model B, Range: —');
  });

  it('follows the pointer to the nearest series and skips gaps', async () => {
    await pointer('pointermove', ...axisPoint(1, 0.85));
    expect(chart().active()).toMatchObject({ index: 1, series: 1 });
    await pointer('click', ...axisPoint(2, 0.1));
    expect(host().clicks.at(-1)).toEqual({ seriesIndex: 0, dataPointIndex: 2, value: 70, category: 'Range' });
    await pointer('pointermove', 1, 1);
    expect(chart().active()).toBeNull();
    await pointer('pointermove', ...axisPoint(1, 0.5));
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(chart().active()).toBeNull();
  });

  it('toggles and highlights series from the legend', async () => {
    legend()[1].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(all('.tx-radar-chart__series--focused').map((series) => series.dataset['series'])).toEqual(['1']);
    legend()[0].click();
    await fixture.whenStable();
    expect(host().toggles).toEqual([{ seriesIndex: 0, name: 'Model A', hidden: true }]);
    await key('ArrowRight');
    await key('ArrowRight');
    await key('ArrowRight');
    expect(chart().active()?.index).toBe(2);
    expect(chart().tooltip()).toBeNull();
    legend()[0].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(all('.tx-radar-chart__series--focused')).toHaveLength(0);
    legend()[1].click();
    legend()[1].dispatchEvent(new Event('pointerleave'));
    await key('Escape');
    expect(all('.tx-radar-chart__area')).toHaveLength(0);
    expect(chart().domain()).toEqual([0, 1]);
    await key('ArrowRight');
    expect(chart().active()).toBeNull();
    await pointer('click', ...axisPoint(0, 0.5));
    expect(chart().active()).toMatchObject({ index: 0, series: -1 });
    expect(host().clicks).toHaveLength(0);
  });

  it('labels the summary, drops the legend for one series and goes empty without data', async () => {
    host().label.set('Cars');
    host().series.set([{ name: 'Only', data: [null, null, null, null, null] }]);
    await fixture.whenStable();
    expect(chart().summary()).toBe('Cars. Radar chart, 1 series, 5 values');
    expect(legend()).toHaveLength(0);
    host().series.set(null);
    host().categories.set(null);
    await fixture.whenStable();
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
  });
});

describe('TxRadarChart recompiled by TestBed', () => {
  it('still renders its areas when a test overrides the component', async () => {
    TestBed.overrideComponent(TxRadarChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-radar-chart__area').length).toBeGreaterThan(0);
  });
});
