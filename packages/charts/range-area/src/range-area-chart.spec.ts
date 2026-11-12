import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxAnnouncer } from '@tectra-ng/core/a11y';
import { TxRangeAreaChart } from './range-area-chart.component';
import { TxRangeAreaPointEvent, TxRangeAreaSeriesToggle, TxRangeAreaXType, TxRangeSeries } from './range-area-chart.types';

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

@Component({
  imports: [TxRangeAreaChart],
  template: `
    <tx-range-area-chart
      [series]="series()"
      [categories]="categories()"
      [xType]="xType()"
      [ariaLabel]="label()"
      (pointClick)="clicks.push($event)"
      (seriesToggle)="toggles.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InteractiveHost {
  readonly series = signal<TxRangeSeries[] | null>([
    { name: 'Kyiv', low: [2, 4, null, 5], high: [9, 11, null, 12], line: [6, 7, 8] },
    { name: 'Lviv', low: [0, 1, 2, 3], high: [6, 8, 9, 7] },
  ]);
  readonly categories = signal<string[] | null>(['Mon', 'Tue', 'Wed']);
  readonly xType = signal<TxRangeAreaXType>('category');
  readonly label = signal('');
  readonly clicks: TxRangeAreaPointEvent[] = [];
  readonly toggles: TxRangeAreaSeriesToggle[] = [];
}

describe('TxRangeAreaChart interaction', () => {
  let fixture: ComponentFixture<InteractiveHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const host = () => fixture.componentInstance;
  const chart = () => fixture.debugElement.query(By.directive(TxRangeAreaChart)).componentInstance as TxRangeAreaChart;
  const plot = () => el('.tx-chart-frame__plot');
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const pointer = async (type: string, clientX: number, clientY: number) => {
    plot().dispatchEvent(new MouseEvent(type, { clientX, clientY, bubbles: true }));
    await fixture.whenStable();
  };
  const at = (index: number, value: number) => ({ x: chart().positions()[index], y: chart().layout().value.map(value) });
  const legend = () => all('.tx-chart-legend__item');

  beforeEach(async () => {
    fixture = TestBed.createComponent(InteractiveHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('follows the pointer, picks the closest band and forgets it outside the plot', async () => {
    const lviv = at(2, 5);
    await pointer('pointermove', lviv.x, lviv.y);
    expect(chart().active()).toMatchObject({ index: 2, series: 1 });
    expect(chart().tooltip()?.rows.map((row) => [row.label, row.value, row.share])).toEqual([
      ['Kyiv', '8', ''],
      ['Lviv', '2 – 9', undefined],
    ]);
    const above = at(1, 10);
    await pointer('click', above.x, above.y);
    expect(host().clicks.at(-1)).toEqual({ seriesIndex: 0, dataPointIndex: 1, category: 'Tue', low: 4, high: 11, line: 7 });
    const below = at(3, 3.5);
    await pointer('click', below.x, below.y);
    expect(host().clicks.at(-1)).toEqual({ seriesIndex: 1, dataPointIndex: 3, category: '4', low: 3, high: 7, line: null });
    await pointer('pointermove', -100, -100);
    expect(chart().active()).toBeNull();
    await pointer('pointermove', lviv.x, lviv.y);
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(chart().active()).toBeNull();    legend()[1].click();
    await fixture.whenStable();
    await pointer('click', lviv.x, lviv.y);
    expect(host().clicks.at(-1)).toEqual({ seriesIndex: 0, dataPointIndex: 2, category: 'Wed', low: null, high: null, line: 8 });
  });

  it('steps through points and series with the keyboard and reads gaps as a dash', async () => {
    const announce = vi.spyOn(TestBed.inject(TxAnnouncer), 'announce');
    await key('ArrowDown');
    expect(chart().active()).toMatchObject({ index: 0, series: 1 });
    await key('ArrowUp');
    expect(chart().active()).toMatchObject({ index: 0, series: 0 });
    await key('ArrowRight');
    await key('ArrowRight');
    await key('ArrowRight');
    expect(chart().active()).toMatchObject({ index: 3, series: 0 });
    expect(announce).toHaveBeenLastCalledWith('Kyiv, 4: 5 – 12');
    await key('Escape');
    expect(chart().active()).toBeNull();
    host().series.set([{ name: 'Gap', low: [1, null], high: [2, null], line: [] }]);
    await fixture.whenStable();
    await key('End');
    expect(chart().active()).toMatchObject({ index: 1, series: 0 });
    expect(announce).toHaveBeenLastCalledWith('Gap, Tue: —');
    expect(chart().tooltip()).toBeNull();
  });

  it('hides series from the legend and dims the others on hover', async () => {
    legend()[0].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(all('.tx-range-area-chart__series--focused').map((series) => series.dataset['series'])).toEqual(['0']);
    legend()[0].click();
    await fixture.whenStable();
    expect(host().toggles).toEqual([{ seriesIndex: 0, name: 'Kyiv', hidden: true }]);
    legend()[0].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(all('.tx-range-area-chart__series--focused')).toHaveLength(0);
    legend()[1].click();
    legend()[1].dispatchEvent(new Event('pointerleave'));
    await fixture.whenStable();
    expect(all('.tx-range-area-chart__band')).toHaveLength(0);
    expect(chart().layout().value.map(0)).toBeGreaterThan(chart().layout().value.map(1));
    await key('ArrowRight');
    expect(chart().active()).toBeNull();
    await pointer('pointermove', chart().positions()[1], chart().layout().plot.top + 10);
    expect(chart().active()).toMatchObject({ index: 1, series: -1 });
    expect(chart().tooltip()).toBeNull();
  });

  it('keeps time indexes for bad dates, labels the summary and handles one point or none', async () => {
    host().xType.set('time');
    host().categories.set(['2026-01-01', 'nope', '2026-03-01', '2026-04-01']);
    host().label.set('Temperature');
    await fixture.whenStable();
    expect(chart().xs()[1]).toBe(1);
    expect(plot().getAttribute('aria-label')).toMatch(/^Temperature\. Range area chart, 2 series/);
    host().xType.set('category');
    host().categories.set(null);
    host().series.set([{ name: 'One', low: [1], high: [2] }]);
    await fixture.whenStable();
    expect(chart().labels()).toEqual(['1']);
    expect(all('.tx-range-area-chart__band')).toHaveLength(1);
    host().series.set(null);
    await fixture.whenStable();
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
    expect(chart().summary()).toBe('Temperature. Range area chart, 0 series, 0 values');
    chart().onPointer({ x: chart().layout().plot.left + 1, y: chart().layout().plot.top + 1, type: 'move', target: null });
    expect(chart().active()?.series).toBe(-1);
    expect(chart().tooltip()).toBeNull();
    expect(chart().activePoints()).toEqual([]);
  });
});

describe('TxRangeAreaChart recompiled by TestBed', () => {
  it('still renders its edges when a test overrides the component', async () => {
    TestBed.overrideComponent(TxRangeAreaChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-range-area-chart__edge').length).toBeGreaterThan(0);
  });
});
