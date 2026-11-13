import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TX_CHART_LEGEND_SIDE, TxChartLegendPosition, TxChartLegendVariant, TxChartTooltipFormatter } from '@tectra-ng/charts/core';
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

  it('finds segments of a turned pie and none in an empty one', () => {
    const turned = pieArcs([1, 1], { width: 200, height: 200, startAngle: -270, endAngle: 90, padding: 0 });
    expect(arcAt(turned.arcs, turned.fit, turned.inner, 100, 190)).toBe(0);
    expect(arcAt(turned.arcs, turned.fit, turned.inner, 100, 10)).toBe(1);
    const empty = pieArcs([0, 0], { width: 200, height: 200 });
    expect(empty.inner).toBe(0);
    expect(empty.arcs.every((arc) => arc.percent === 0)).toBe(true);
    expect(arcAt(empty.arcs, empty.fit, empty.inner, 100, 50)).toBe(-1);
  });

  it('keeps a radius for a zero sweep', () => {
    const fit = fitPie(100, 100, 30, 30, 0);
    expect(Number.isFinite(fit.radius)).toBe(true);
    expect(fit.radius).toBeGreaterThan(0);
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

@Component({
  imports: [TxPieChart],
  template: `
    <tx-pie-chart
      id="opts"
      [pieData]="data()"
      [chartWidth]="width()"
      [chartHeight]="height()"
      [legendPosition]="legendPosition()"
      [legendVariant]="variant()"
      [legendValues]="values()"
      [showDataLabels]="dataLabels()"
      [tooltipFormatter]="formatter()"
      [totalFormatter]="totalFormatter()"
      [toolbar]="toolbar()"
      [ariaLabel]="ariaLabel()"
      [unstyled]="unstyled()"
      totalLabel="Total"
      (segmentClick)="clicks.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OptionsHost {
  readonly data = signal<TxPieData | null>({ series: [10, 80, 10], labels: ['North', 'South', 'East'] });
  readonly width = signal<number | string>(200);
  readonly height = signal<number | string>(400);
  readonly legendPosition = signal<TxChartLegendPosition>('bottom');
  readonly variant = signal<TxChartLegendVariant>('dot');
  readonly values = signal(false);
  readonly dataLabels = signal(true);
  readonly formatter = signal<TxChartTooltipFormatter | null>(null);
  readonly totalFormatter = signal<((value: number) => string) | null>(null);
  readonly toolbar = signal(true);
  readonly ariaLabel = signal('');
  readonly unstyled = signal<boolean | undefined>(undefined);
  readonly clicks: TxPieSegmentEvent[] = [];
}

describe('TxPieChart options', () => {
  let fixture: ComponentFixture<OptionsHost>;
  let host: OptionsHost;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('#opts .tx-chart-frame__plot');
  const tooltip = () => document.querySelector('.tx-chart-frame__tooltip') as HTMLElement | null;
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const pointer = async (type: string, x: number, y: number) => {
    plot().dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(OptionsHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('takes CSS sizes and fits the plot to a relative height', async () => {
    host.width.set('320px');
    host.height.set('100%');
    await fixture.whenStable();
    expect(el('#opts').style.width).toBe('320px');
    expect(el('#opts').style.height).toBe('100%');
    expect(plot().style.height).toBe('200px');
    host.height.set('260px');
    host.toolbar.set(false);
    await fixture.whenStable();
    expect(Number.parseFloat(plot().style.height)).toBeLessThanOrEqual(200);
  });

  it('narrows the pie next to a side legend', async () => {
    host.width.set(400);
    host.legendPosition.set('right');
    await fixture.whenStable();
    expect(plot().style.height).toBe(`${400 - TX_CHART_LEGEND_SIDE}px`);
  });

  it('shows stat cards with shares and no tooltip', async () => {
    host.variant.set('stat');
    await fixture.whenStable();
    expect(all('#opts .tx-chart-legend__stat').map((item) => item.textContent)).toEqual(['10', '80', '10']);
    expect(all('#opts .tx-chart-legend__caption').map((item) => item.textContent)).toEqual(['10%', '80%', '10%']);
    await key('ArrowRight');
    expect(tooltip()).toBeNull();
    all('#opts .tx-chart-legend__item')[1].click();
    await fixture.whenStable();
    expect(all('#opts .tx-chart-legend__caption').map((item) => item.textContent)).toEqual(['50%', '0%', '50%']);
  });

  it('gives hidden segments no share in the value legend', async () => {
    host.values.set(true);
    await fixture.whenStable();
    all('#opts .tx-chart-legend__item')[0].click();
    await fixture.whenStable();
    expect(all('#opts .tx-chart-legend__percent').map((item) => item.textContent)).toEqual(['0%', '88.9%', '11.1%']);
  });

  it('wraps pill legends and hides the data labels on request', async () => {
    host.variant.set('pill');
    host.data.set({ series: [1, 1, 1, 1, 1, 1], labels: ['Alpha region', 'Beta region', 'Gamma region', 'Delta region', 'Epsilon region', 'Zeta region'] });
    await fixture.whenStable();
    expect(all('#opts .tx-chart-legend__item')).toHaveLength(6);
    expect(all('#opts .tx-pie-chart__label')).toHaveLength(6);
    host.dataLabels.set(false);
    await fixture.whenStable();
    expect(all('#opts .tx-pie-chart__label')).toHaveLength(0);
  });

  it('leaves narrow segments without a label and labels missing names as empty', async () => {
    host.data.set({ series: [999, 1], labels: ['Most'] });
    await fixture.whenStable();
    expect(all('#opts .tx-pie-chart__label').map((label) => label.textContent?.trim())).toEqual(['99.9%']);
    expect(all('#opts tbody tr')[1].querySelector('th, td')?.textContent?.trim()).toBe('');
  });

  it('places the tooltip on the side of the segment and formats it', async () => {
    host.formatter.set((value, { seriesIndex }) => `#${seriesIndex}: ${value}`);
    await key('ArrowRight');
    expect(tooltip()?.textContent).toContain('#0: 10');
    await key('ArrowRight');
    expect(tooltip()?.textContent).toContain('#1: 80');
    host.data.set({ series: [30, 10, 60], labels: ['North', 'South', 'East'] });
    await key('ArrowRight');
    expect(tooltip()?.textContent).toContain('#2: 60');
    await key('ArrowLeft');
    expect(tooltip()?.textContent).toContain('#1: 10');
    expect(document.querySelector('.tx-chart-frame__tooltip-title')).toBeNull();
    host.data.set({ series: [30, 10, 60], labels: ['North', 'South', 'East'], title: 'Sales by region' });
    await key('ArrowRight');
    expect(document.querySelector('.tx-chart-frame__tooltip-title')?.textContent).toBe('Sales by region');
  });

  it('jumps to the first and last segment', async () => {
    await key('ArrowLeft');
    expect(el('#opts .tx-pie-chart__center-name').textContent?.trim()).toBe('East');
    await key('Home');
    expect(el('#opts .tx-pie-chart__center-name').textContent?.trim()).toBe('North');
    await key('End');
    expect(el('#opts .tx-pie-chart__center-name').textContent?.trim()).toBe('East');
  });

  it('formats the total and prefixes the summary with the aria label', async () => {
    host.totalFormatter.set((value) => `${value} units`);
    host.ariaLabel.set('Regions');
    await fixture.whenStable();
    expect(el('#opts .tx-pie-chart__center-value').textContent?.trim()).toBe('100 units');
    expect(plot().getAttribute('aria-label')).toBe('Regions. Donut chart, 1 series, 3 values, total 100');
  });

  it('highlights a segment from the legend without a tooltip', async () => {
    const items = all('#opts .tx-chart-legend__item');
    items[1].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(el('#opts').classList).toContain('tx-pie-chart--hovering');
    expect(el('#opts .tx-pie-chart__center-name').textContent?.trim()).toBe('South');
    expect(tooltip()).toBeNull();
    items[1].dispatchEvent(new Event('pointerleave'));
    await fixture.whenStable();
    expect(el('#opts').classList).not.toContain('tx-pie-chart--hovering');
    items[1].click();
    await fixture.whenStable();
    items[1].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(el('#opts').classList).not.toContain('tx-pie-chart--hovering');
  });

  it('follows the pointer and ignores the centre and the outside', async () => {
    const segment = el('#opts .tx-pie-chart__segment');
    expect(segment).not.toBeNull();
    await pointer('pointermove', 100, 30);
    expect(el('#opts .tx-pie-chart__segment--hovered')).not.toBeNull();
    await pointer('pointermove', 100, 100);
    expect(el('#opts .tx-pie-chart__segment--hovered')).toBeNull();
    await pointer('click', 2, 2);
    expect(host.clicks).toEqual([]);
    await pointer('pointermove', 100, 186);
    expect(el('#opts .tx-pie-chart__segment--hovered').getAttribute('data-index')).toBe('1');
    expect(tooltip()?.textContent).toContain('South');
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(el('#opts .tx-pie-chart__segment--hovered')).toBeNull();
  });

  it('drops the styling when unstyled', async () => {
    expect(el('#opts').getAttribute('data-styled')).toBe('true');
    host.unstyled.set(true);
    await fixture.whenStable();
    expect(el('#opts').hasAttribute('data-styled')).toBe(false);
    expect(el('#opts .tx-pie-chart__segment').getAttribute('d')).not.toMatch(/A\d(\.\d+)?,\d(\.\d+)? 0 0 1/);
  });

  it('shows "No data" without data and ignores the keyboard', async () => {
    host.data.set(null);
    await fixture.whenStable();
    expect(el('#opts .tx-chart-frame__empty').textContent).toContain('No data');
    await key('ArrowRight');
    expect(el('#opts').classList).not.toContain('tx-pie-chart--hovering');
  });
});

describe('TxPieCenter', () => {
  it('guards the template context', () => {
    expect(TxPieCenter.ngTemplateContextGuard({} as TxPieCenter, { $implicit: {} })).toBe(true);
    expect(TxPieCenter.ngTemplateContextGuard({} as TxPieCenter, null)).toBe(false);
  });
});

describe('TxPieChart recompiled by TestBed', () => {
  it('still renders its centre template when a test overrides the component', async () => {
    TestBed.overrideComponent(TxPieChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#center .own-center').textContent).toBe('100');
    expect(fixture.nativeElement.querySelectorAll('#main .tx-pie-chart__segment')).toHaveLength(3);
  });
});
