import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  });
});

describe('TxRankChart', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const main = () => fixture.nativeElement.querySelector('#main') as HTMLElement;
  const chart = () => fixture.debugElement.query((element) => element.nativeElement === main()).componentInstance as TxRankChart;

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
