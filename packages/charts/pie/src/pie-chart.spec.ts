import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxPieCenter } from './pie-center.directive';
import { TxPieChart } from './pie-chart.component';
import { TxPieData, TxPieSegmentEvent, TxPieSegmentToggle } from './pie-chart.types';
import { arcAt, arcPath, fitPie, maxCornerRadius, pieAngles, pieArcs } from './pie-layout';
import { TxPieLegendPipe, pieLegend } from './pie-legend';

@Component({
  imports: [TxPieChart, TxPieCenter, TxPieLegendPipe],
  template: `
    <tx-pie-chart
      id="main"
      [pieData]="data()"
      [chartWidth]="200"
      [chartHeight]="300"
      [totalLabel]="totalLabel()"
      [legendValues]="values()"
      [donutSize]="donut()"
      [pt]="{ segment: { class: 'own-segment' } }"
      (segmentClick)="clicks.push($event)"
      (segmentToggle)="toggles.push($event)"
    />
    <tx-pie-chart id="center" [pieData]="data()" [chartWidth]="200" [chartHeight]="240">
      <ng-template txPieCenter let-center>
        <span class="own-center">{{ center.total }}</span>
      </ng-template>
    </tx-pie-chart>
    <tx-pie-chart id="zero" [pieData]="{ series: [0, 0], labels: ['A', 'B'] }" />
    @for (item of data() | txPieLegend; track item.label) {
      <span class="own-row" [style.color]="item.color">{{ item.label }} {{ item.percent }}</span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly data = signal<TxPieData>({ series: [60, 30, 10], labels: ['Search', 'Direct', 'Email'] });
  readonly totalLabel = signal('Visits');
  readonly values = signal(false);
  readonly donut = signal<string>('65%');
  readonly clicks: TxPieSegmentEvent[] = [];
  readonly toggles: TxPieSegmentToggle[] = [];
}

describe('pie layout', () => {
  it('splits the circle by value', () => {
    const angles = pieAngles([1, 1, 2]);
    expect(angles[2].start).toBeCloseTo(Math.PI);
    expect(angles[2].end).toBeCloseTo(Math.PI * 2);
    expect(pieAngles([1, -3, 1], -90, 90)[1].end - pieAngles([1, -3, 1], -90, 90)[1].start).toBe(0);
  });

  it('draws arcs, rings and full circles', () => {
    expect(arcPath(50, 50, 0, 50, 0, Math.PI / 2)).toBe('M50,0A50,50 0 0 1 100,50L50,50Z');
    expect(arcPath(50, 50, 25, 50, 0, Math.PI / 2)).toContain('A25,25 0 0 0');
    expect(arcPath(50, 50, 0, 50, 0, Math.PI * 2).match(/A/g)).toHaveLength(2);
    expect(arcPath(50, 50, 0, 50, 1, 1)).toBe('');
  });

  it('rounds the corners and shrinks the rounding on narrow segments', () => {
    const rounded = arcPath(50, 50, 30, 50, 0, Math.PI / 2, 4);
    expect(rounded.match(/A4,4/g)).toHaveLength(4);
    expect(arcPath(50, 50, 0, 50, 0, Math.PI / 2, 4).match(/A4,4/g)).toHaveLength(2);
    expect(maxCornerRadius(45, 50, Math.PI)).toBe(2.5);
    expect(maxCornerRadius(30, 50, 0.02)).toBeLessThan(1);
    expect(arcPath(50, 50, 30, 50, 0, 0.01, 4)).not.toContain('A4,4');
  });

  it('fits full and half circles into the box', () => {
    expect(fitPie(200, 200, 0, 360, 0)).toEqual({ cx: 100, cy: 100, radius: 100 });
    const half = fitPie(200, 100, -90, 90, 0);
    expect(half.radius).toBe(100);
    expect(half.cy).toBe(100);
  });

  it('finds the segment under a point', () => {
    const { arcs, fit, inner } = pieArcs([1, 1], { width: 200, height: 200, donutSize: 0.5, padding: 0 });
    expect(arcAt(arcs, fit, inner, 150, 100)).toBe(0);
    expect(arcAt(arcs, fit, inner, 50, 100)).toBe(1);
    expect(arcAt(arcs, fit, inner, 100, 100)).toBe(-1);
    expect(arcs[0].percent).toBe(50);
  });

  it('builds legend rows with the chart colours', () => {
    expect(pieLegend({ series: [3, 1], labels: ['A'] })).toEqual([
      { label: 'A', value: 3, percent: 75, color: 'var(--tx-chart-series-color1)' },
      { label: '', value: 1, percent: 25, color: 'var(--tx-chart-series-color2)' },
    ]);
    expect(pieLegend({ series: [0], labels: ['A'], colors: ['red'] })[0]).toMatchObject({ percent: 0, color: 'red' });
    expect(pieLegend(null)).toEqual([]);
  });
});

describe('TxPieChart', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = (id = 'main') => el(`#${id} .tx-chart-frame__plot`);
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('draws a donut with percent labels and the total in the centre', () => {
    expect(all('#main .tx-pie-chart__segment')).toHaveLength(3);
    expect(el('#main .tx-pie-chart__segment').classList).toContain('own-segment');
    expect(all('#main .tx-pie-chart__label').map((label) => label.textContent?.trim())).toEqual(['60.0%', '30.0%', '10.0%']);
    expect(el('#main .tx-pie-chart__center-name').textContent?.trim()).toBe('Visits');
    expect(el('#main .tx-pie-chart__center-value').textContent?.trim()).toBe('100');
    expect(el('#main').style.width).toBe('200px');
    expect(plot().style.height).toBe('200px');
    expect(plot().getAttribute('aria-label')).toBe('Donut chart, 1 series, 3 values, total 100');
    expect(all('#main tbody tr')[0].textContent).toContain('60%');
  });

  it('turns into a pie and lists values in the legend', async () => {
    fixture.componentInstance.donut.set('0%');
    fixture.componentInstance.values.set(true);
    await fixture.whenStable();
    expect(el('#main').classList).not.toContain('tx-pie-chart--donut');
    expect(el('#main .tx-pie-chart__center-name')).toBeNull();
    expect(el('#main .tx-chart-legend__value').textContent).toBe('60');
    expect(el('#main .tx-chart-legend__percent').textContent).toBe('60%');
  });

  it('walks the segments with the keyboard and shows them in the centre', async () => {
    await key('ArrowRight');
    expect(el('#main .tx-pie-chart__center-name').textContent?.trim()).toBe('Search');
    expect(el('#main .tx-pie-chart__segment--hovered').getAttribute('data-index')).toBe('0');
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Search');
    expect(panel.querySelector('.tx-chart-frame__tooltip-share')?.textContent).toBe('60%');
    expect(panel.getAttribute('data-side')).toMatch(/^(top|bottom|left|right)$/);
    await key('ArrowLeft');
    expect(el('#main .tx-pie-chart__center-name').textContent?.trim()).toBe('Email');
    await key('Escape');
    expect(el('#main .tx-pie-chart__center-name').textContent?.trim()).toBe('Visits');
  });

  it('hides a segment from the legend and reports clicks', async () => {
    all('#main .tx-chart-legend__item')[0].click();
    await fixture.whenStable();
    expect(all('#main .tx-pie-chart__segment')).toHaveLength(2);
    expect(el('#main .tx-pie-chart__center-value').textContent?.trim()).toBe('40');
    expect(fixture.componentInstance.toggles).toEqual([{ index: 0, label: 'Search', hidden: true }]);
    plot().dispatchEvent(new MouseEvent('click', { clientX: 100, clientY: 186, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toMatchObject({ label: 'Direct', value: 30 });
  });

  it('renders a centre template, own legend rows and "No data"', () => {
    expect(el('#center .own-center').textContent).toBe('100');
    expect(all('.own-row').map((row) => row.textContent)).toEqual(['Search 60', 'Direct 30', 'Email 10']);
    expect(el('#zero .tx-chart-frame__empty').textContent).toContain('No data');
  });
});
