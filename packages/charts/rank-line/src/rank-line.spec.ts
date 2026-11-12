import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxChartLegendTemplate, TxChartTooltipTemplate } from '@tectra-ng/charts/core';
import { rankLineColor, rankTickStep, rankTimeExtent, rankY } from './rank-line-layout';
import { TxRankChart } from './rank-line.component';
import { TxRankLineEvent, TxRankSeries } from './rank-line.types';

@Component({
  imports: [TxRankChart],
  template: `
    <tx-rank-chart
      id="main"
      [series]="series()"
      [maxRank]="maxRank()"
      rankLabel="Position"
      [height]="300"
      showLegend
      ariaLabel="Positions"
      [pt]="{ line: { class: 'own-line' } }"
      (pointClick)="clicks.push($event)"
    />
    <tx-rank-chart id="empty" [series]="[{ name: 'A', points: [{ time: '2026-01-01', rank: null }] }]" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly maxRank = signal(20);
  readonly series = signal<TxRankSeries[]>([
    {
      name: 'site.com',
      points: [
        { time: '2026-03-01T10:00:00Z', rank: 3 },
        { time: '2026-03-02T10:00:00Z', rank: null },
        { time: '2026-03-03T10:00:00Z', rank: 1, note: 'Snippet' },
      ],
    },
    { name: 'shop.com', color: '#ff0000', points: [{ time: '2026-03-01T10:00:00Z', rank: 8 }, { time: '2026-03-03T10:00:00Z', rank: 12 }] },
  ]);
  readonly clicks: TxRankLineEvent[] = [];
}

describe('rank line layout', () => {
  it('cycles twelve colours and picks the tick step', () => {
    expect(rankLineColor(0)).toBe('var(--tx-chart-rank-line-color1)');
    expect(rankLineColor(13)).toBe('var(--tx-chart-rank-line-color2)');
    expect(rankTickStep(20)).toBe(5);
    expect(rankTickStep(50)).toBe(10);
  });

  it('maps rank 1 near the top and clamps deep ranks', () => {
    expect(rankY(0, 20, 10, 200)).toBe(10);
    expect(rankY(10, 20, 10, 200)).toBe(110);
    expect(rankY(80, 20, 10, 200)).toBe(210);
  });

  it('finds the time extent and widens a single time', () => {
    expect(rankTimeExtent([{ name: 'a', points: [{ time: 100, rank: 1 }, { time: 300, rank: null }] }])).toEqual([100, 300]);
    expect(rankTimeExtent([{ name: 'a', points: [{ time: 1000, rank: 1 }] }])).toEqual([1000 - 43_200_000, 1000 + 43_200_000]);
    expect(rankTimeExtent([])).toBeNull();
    expect(rankTimeExtent([{ name: 'a', points: [{ time: 'not a date', rank: 1 }, { time: 500, rank: 2 }] }])).toEqual([500 - 43_200_000, 500 + 43_200_000]);
  });

  it('puts every rank on the top edge without a rank range', () => {
    expect(rankY(5, 0, 10, 200)).toBe(10);
  });
});

describe('TxRankChart', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const main = () => fixture.nativeElement.querySelector('#main') as HTMLElement;
  const chart = () => fixture.debugElement.query(By.css('#main')).componentInstance as TxRankChart;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('draws a line per series with a gap and a marker per ranked check', () => {
    const lines = main().querySelectorAll<SVGPathElement>('.tx-rank-chart__line');
    expect(lines).toHaveLength(2);
    expect(lines[0].getAttribute('d')?.match(/M/g)).toHaveLength(2);
    expect(lines[0].classList).toContain('own-line');
    expect(lines[1].style.getPropertyValue('--tx-rank-chart-color')).toBe('#ff0000');
    expect(main().querySelectorAll('.tx-rank-chart__marker')).toHaveLength(4);
  });

  it('puts rank 1 above deeper ranks and labels the axis from 1', () => {
    const markers = chart().markers();
    const first = markers.find((marker) => marker.rank === 1);
    const deep = markers.find((marker) => marker.rank === 12);
    expect(first?.y ?? Infinity).toBeLessThan(deep?.y ?? -Infinity);
    const labels = [...main().querySelectorAll('.tx-chart-axes__axis[data-position="left"] .tx-chart-axes__label')].map((label) => label.textContent?.trim());
    expect(labels).toEqual(['1', '5', '10', '15', '20']);
    const ys = [...main().querySelectorAll<SVGTextElement>('.tx-chart-axes__axis[data-position="left"] .tx-chart-axes__label')].map((label) => Number(label.getAttribute('y')));
    expect(ys[0]).toBeLessThan(ys[4]);
  });

  it('shows the tooltip with the date, rank and note and emits pointClick', () => {
    const marker = chart().markers().find((item) => item.rank === 1);
    chart().onPointer({ x: (marker?.x ?? 0) + 3, y: marker?.y ?? 0, type: 'click', target: null });
    const tooltip = chart().tooltip();
    expect(tooltip?.rows[0]).toMatchObject({ label: 'site.com', value: 'Position: 1' });
    expect(tooltip?.note).toBe('Snippet');
    expect(tooltip?.title).toContain('2026');
    expect(host.clicks[0]).toMatchObject({ seriesIndex: 0, pointIndex: 2, rank: 1, note: 'Snippet' });
    chart().onPointer({ x: -500, y: -500, type: 'move', target: null });
    expect(chart().tooltip()).toBeNull();
  });

  it('walks a series with left / right and switches series with up / down', () => {
    chart().onNavigate(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(chart().activeMarker()).toMatchObject({ series: 0, rank: 3 });
    chart().onNavigate(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(chart().activeMarker()).toMatchObject({ series: 0, rank: 1 });
    chart().onNavigate(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(chart().activeMarker()).toMatchObject({ series: 1, rank: 12 });
    chart().onNavigate(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(chart().activeMarker()).toBeNull();
  });

  it('hides a series from the legend, uses wider ticks for deep ranks and shows "No data"', async () => {
    chart().onLegendToggle(chart().keys()[1]);
    await fixture.whenStable();
    expect(main().querySelectorAll('.tx-rank-chart__line')).toHaveLength(1);
    host.maxRank.set(50);
    await fixture.whenStable();
    const labels = [...main().querySelectorAll('.tx-chart-axes__axis[data-position="left"] .tx-chart-axes__label')].map((label) => label.textContent?.trim());
    expect(labels).toContain('10');
    expect(labels).not.toContain('5');
    expect((fixture.nativeElement.querySelector('#empty') as HTMLElement).textContent).toContain('No data');
  });
});

@Component({
  imports: [TxRankChart, TxChartLegendTemplate, TxChartTooltipTemplate],
  template: `
    <tx-rank-chart [series]="series()" [showLegend]="showLegend()" [showTooltip]="showTooltip()" (seriesToggle)="toggles.push($event)">
      @if (templates()) {
        <ng-template txChartLegend let-item><span class="own-legend">{{ item.label }}</span></ng-template>
        <ng-template txChartTooltip let-data><span class="own-tooltip">{{ data.rows[0].value }}</span></ng-template>
      }
    </tx-rank-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OptionsHost {
  readonly series = signal<TxRankSeries[] | null>([
    {
      name: 'site.com',
      points: [
        { time: 0, rank: 2 },
        { time: 86_400_000, rank: 4, note: 'Drop' },
        { time: 172_800_000, rank: 3 },
      ],
    },
    {
      name: 'shop.com',
      points: [
        { time: 0, rank: 6 },
        { time: 172_800_000, rank: 7 },
      ],
    },
  ]);
  readonly showLegend = signal(true);
  readonly showTooltip = signal(true);
  readonly templates = signal(false);
  readonly toggles: { index: number; name: string; hidden: boolean }[] = [];
}

describe('TxRankChart options', () => {
  let fixture: ComponentFixture<OptionsHost>;
  let host: OptionsHost;
  const chart = () => fixture.debugElement.query(By.directive(TxRankChart)).componentInstance as TxRankChart;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const key = async (name: string) => {
    el('.tx-chart-frame__plot').dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const panel = () => document.querySelector('.tx-chart-frame__tooltip') as HTMLElement | null;

  beforeEach(async () => {
    fixture = TestBed.createComponent(OptionsHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('shows the empty state and a plain summary without series', async () => {
    host.series.set(null);
    await fixture.whenStable();
    expect(chart().legendShown()).toBe(false);
    expect(chart().markers()).toEqual([]);
    expect(chart().summary()).toBe('Rank chart, 0 series, 0 values');
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
    chart().onNavigate(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(chart().active()).toBeNull();
  });

  it('jumps to the ends and starts from the last marker going back', async () => {
    await key('ArrowLeft');
    expect(chart().activeMarker()).toMatchObject({ series: 1, rank: 7 });
    await key('Escape');
    await key('ArrowUp');
    expect(chart().activeMarker()).toMatchObject({ series: 1, rank: 7 });
    await key('Home');
    expect(chart().activeMarker()).toMatchObject({ series: 0, rank: 2 });
    await key('End');
    expect(chart().activeMarker()).toMatchObject({ series: 1, rank: 7 });
    await key('ArrowLeft');
    expect(chart().activeMarker()).toMatchObject({ series: 1, rank: 6 });
    await key('ArrowLeft');
    expect(chart().activeMarker()).toMatchObject({ series: 1, rank: 6 });
  });

  it('switches to the nearest marker in time of the series above', async () => {
    await key('End');
    await key('ArrowUp');
    expect(chart().activeMarker()).toMatchObject({ series: 0, rank: 3 });
    await key('ArrowLeft');
    await key('ArrowUp');
    expect(chart().activeMarker()).toMatchObject({ series: 1, rank: 6 });
  });

  it('shows the plain rank without a rank label and the note in the tooltip', async () => {
    await key('Home');
    await key('ArrowRight');
    expect(chart().tooltip()?.rows[0].value).toBe('4');
    expect(chart().tooltip()?.note).toBe('Drop');
    expect(panel()?.textContent).toContain('Drop');
    expect(chart().dataTable().columns[0].label).toBe('Rank');
    expect(chart().dataTable().rows.map((row) => row.cells[0])).toEqual(['2', '6', '4 (Drop)', '3', '7']);
    host.showTooltip.set(false);
    await fixture.whenStable();
    expect(chart().tooltip()).toBeNull();
  });

  it('forgets the hovered marker when the pointer leaves', async () => {
    const marker = chart().markers()[0];
    chart().onPointer({ x: marker.x, y: marker.y, type: 'move', target: null });
    expect(chart().active()).toBe(marker.key);
    chart().onPointer({ x: marker.x, y: marker.y, type: 'leave', target: null });
    expect(chart().active()).toBeNull();
  });

  it('toggles series from the legend and reports an unknown key without a name', async () => {
    (fixture.nativeElement.querySelectorAll('.tx-chart-legend__item')[0] as HTMLElement).click();
    await fixture.whenStable();
    expect(host.toggles[0]).toEqual({ index: 0, name: 'site.com', hidden: true });
    expect(fixture.nativeElement.querySelectorAll('.tx-rank-chart__line')).toHaveLength(1);
    chart().onLegendToggle('9:ghost');
    expect(host.toggles[1]).toEqual({ index: -1, name: '', hidden: true });
  });

  it('renders its own legend and tooltip templates', async () => {
    host.templates.set(true);
    await fixture.whenStable();
    expect([...fixture.nativeElement.querySelectorAll('.own-legend')].map((item: Element) => item.textContent)).toEqual(['site.com', 'shop.com']);
    await key('Home');
    expect(panel()?.querySelector('.own-tooltip')?.textContent).toBe('2');
  });
});

describe('TxRankChart recompiled by TestBed', () => {
  it('still renders its lines and legend template when a test overrides the component', async () => {
    TestBed.overrideComponent(TxRankChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(OptionsHost);
    fixture.componentInstance.templates.set(true);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.tx-rank-chart__line')).toHaveLength(2);
    expect(fixture.nativeElement.querySelectorAll('.own-legend')).toHaveLength(2);
    fixture.nativeElement.querySelector('.tx-chart-frame__plot').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    expect(document.querySelector('.tx-chart-frame__tooltip .own-tooltip')?.textContent).toBe('2');
    document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = ''));
  });
});
