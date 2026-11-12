import { ChangeDetectionStrategy, Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  TxChartAnnotationShape,
  chartAnnotationShapes,
  chartCategoryIndex,
} from './chart-annotations';
import { TxChartAnnotations } from './chart-annotations.component';
import { TxChartAxes } from './chart-axes.component';
import { TxChartHoverBand } from './chart-hover-band.component';
import { cycleIndex, stepIndex } from './chart-interaction';
import { TxChartLegend } from './chart-legend.component';
import { TxChartMenu } from './chart-menu.component';
import { TX_CHART_ENTER_MS, injectChartEntrance, prefersReducedMotion } from './chart-motion';
import { chartHeightValue } from './chart-size';
import { TxChartLegendTemplate, TxChartTooltipTemplate } from './chart-templates.directive';
import { parseRatio, readTokenNumber } from './chart-token';
import { TxChartAxesModel, TxChartRect } from './chart.types';
import { linePath, monotoneTangents } from './curve';
import { decimateSeries } from './decimate';
import { tickFormatter, timeTickOptions, timeTooltipFormatter } from './format';
import { normalizeSeries } from './series-data';
import { topOfStack } from './stack';

describe('chart helpers', () => {
  it('steps and cycles through indexes', () => {
    expect(stepIndex('ArrowLeft', 2, 5)).toBe(1);
    expect(stepIndex('ArrowLeft', 0, 5)).toBe(0);
    expect(stepIndex('ArrowLeft', -1, 5)).toBe(4);
    expect(stepIndex('x', 2, 5)).toBe(2);
    expect(stepIndex('ArrowRight', 1, 0)).toBe(-1);
    expect(cycleIndex(1, 1, [])).toBe(-1);
    expect(cycleIndex(7, 1, [2, 4])).toBe(2);
  });

  it('reads numbers and ratios from tokens', () => {
    const element = document.createElement('div');
    element.style.setProperty('--ratio', '40%');
    document.body.appendChild(element);
    expect(readTokenNumber(element, '--ratio', 1)).toBe(0.4);
    expect(readTokenNumber(element, '--missing', 3)).toBe(3);
    element.remove();
    expect(readTokenNumber(null, '--ratio', 2)).toBe(2);
    expect(readTokenNumber(document.implementation.createHTMLDocument().body, '--ratio', 5)).toBe(
      5,
    );
    expect(parseRatio(Number.NaN, 7)).toBe(7);
    expect(parseRatio(0.5, 7)).toBe(0.5);
    expect(parseRatio('wide', 7)).toBe(7);
    expect(parseRatio('1.5', 7)).toBe(1.5);
  });

  it('falls back to the default height for bad values', () => {
    expect(chartHeightValue(Number.NaN)).toBe(350);
    expect(chartHeightValue(-10, 200)).toBe(200);
    expect(chartHeightValue('20rem')).toBe(350);
    expect(chartHeightValue(' 240px ')).toBe(240);
  });

  it('finds the top of a stack by sign', () => {
    const stacked: ([number, number] | null)[][] = [[[0, 5]], [[5, 5]], [[0, -3]], [null]];
    expect(topOfStack(stacked, 0, 1)).toBe(0);
    expect(topOfStack(stacked, 0, -1)).toBe(2);
  });

  it('keeps short series with gaps and flattens vertical segments', () => {
    expect(decimateSeries([{ x: 0, y: 1 }, null, { x: 2, y: 3 }], 10)).toEqual([
      { x: 0, y: 1, index: 0 },
      null,
      { x: 2, y: 3, index: 2 },
    ]);
    expect(
      monotoneTangents([
        { x: 0, y: 0 },
        { x: 0, y: 5 },
        { x: 1, y: 6 },
      ]),
    ).toEqual([0, 0, 1]);
    expect(linePath([{ x: 3, y: 4 }])).toBe('M3,4');
  });

  it('reads numeric categories of a linear axis and drops the rest', () => {
    const table = normalizeSeries([{ name: 'A', data: [1, 2, 3] }], ['10', 'ten', 30], 'linear');
    expect(table.xs).toEqual([10, 30]);
    expect(table.values).toEqual([[1, 3]]);
  });

  it('formats ticks and tooltips for every time unit', () => {
    const interval = (unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second') => ({
      unit,
      step: 1,
      duration: 1,
    });
    const year = 400 * 86_400_000;
    expect(timeTickOptions(interval('month'), year)).toEqual({ month: 'short', year: 'numeric' });
    expect(timeTickOptions(interval('week'), 1)).toEqual({ day: 'numeric', month: 'short' });
    expect(timeTickOptions(interval('hour'), 1)).toEqual({ hour: '2-digit', minute: '2-digit' });
    expect(timeTickOptions(interval('minute'), 1)).toEqual({ hour: '2-digit', minute: '2-digit' });
    expect(timeTickOptions(interval('second'), 1)).toHaveProperty('second');
    const time = new Date(2026, 4, 3, 14, 30).getTime();
    expect(timeTooltipFormatter('en-US', interval('month'))(time)).toContain('2026');
    expect(timeTooltipFormatter('en-US', interval('week'))(time)).toContain('2026');
    expect(timeTooltipFormatter('en-US', interval('minute'))(time)).toMatch(/02:30|14:30/);
    expect(tickFormatter('en-US', [0, 0.5, 1], 'integer')(0.5)).toMatch(/^[01]$/);
    expect(tickFormatter('en-US', [5])(5)).toBe('5');
    expect(tickFormatter('en-US', [0, 50], 'percent')(50)).toBe('50%');
  });

  it('accepts any context in the template guards', () => {
    expect(TxChartLegendTemplate.ngTemplateContextGuard({} as TxChartLegendTemplate, {})).toBe(
      true,
    );
    expect(TxChartTooltipTemplate.ngTemplateContextGuard({} as TxChartTooltipTemplate, null)).toBe(
      false,
    );
  });
});

describe('chart annotation shapes', () => {
  const plot = { left: 40, top: 10, width: 200, height: 100 };
  const mapping = {
    plot,
    x: (value: unknown) => (typeof value === 'number' ? value : null),
    y: (value: number) => value,
  };

  it('finds categories by index, label and date', () => {
    expect(chartCategoryIndex(1, ['a', 'b'])).toBe(1);
    expect(chartCategoryIndex(1.5, ['a', 'b'])).toBe(-1);
    expect(chartCategoryIndex(-1, ['a', 'b'])).toBe(-1);
    const date = new Date(Date.UTC(2026, 0, 1));
    expect(chartCategoryIndex(date, ['x', date.toISOString()])).toBe(1);
  });

  it('drops shapes outside the plot or thinner than half a pixel', () => {
    expect(chartAnnotationShapes(null, mapping)).toEqual([]);
    const shapes = chartAnnotationShapes(
      [
        { type: 'x-line', x: 500 },
        { type: 'x-band', from: 100, to: 100.2 },
        { type: 'y-band', from: 50, to: 50.2 },
        { type: 'x-band', from: 'a', to: 120 },
        { type: 'point', x: 100, y: 500 },
        { type: 'point', x: 'none', y: 50 },
        { type: 'point', x: 60, y: 50, label: 'Inside' },
      ],
      mapping,
    );
    expect(shapes.map((shape) => shape.key)).toEqual(['6:point']);
  });

  it('swaps a point on a horizontal chart', () => {
    const [point] = chartAnnotationShapes([{ type: 'point', x: 50, y: 100 }], {
      ...mapping,
      horizontal: true,
    });
    expect(point).toMatchObject({ x1: 100, y1: 50 });
    expect(
      chartAnnotationShapes([{ type: 'point', x: 500, y: 100 }], { ...mapping, horizontal: true }),
    ).toEqual([]);
  });
});

@Component({
  imports: [TxChartAxes, TxChartHoverBand, TxChartAnnotations],
  template: `
    <svg>
      <g [tx-chart-axes]="model" />
      <g [tx-chart-hover-band]="band()" />
      <g class="all" [tx-chart-annotations]="shapes" />
      <g class="front" [tx-chart-annotations]="shapes" layer="front" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SvgHost {
  readonly band = signal<TxChartRect | null>(null);
  readonly model: TxChartAxesModel = {
    grid: [],
    zero: null,
    axes: [
      {
        position: 'left',
        line: { x1: 0, y1: 0, x2: 0, y2: 100 },
        labels: [
          {
            text: 'Long label',
            x: 10,
            y: 20,
            anchor: 'end',
            baseline: 'middle',
            rotate: -45,
            title: 'Long label in full',
          },
        ],
        title: { text: 'Count', x: 5, y: 50, rotate: -90 },
      },
      {
        position: 'bottom',
        line: null,
        labels: [],
        title: { text: 'Day', x: 50, y: 95, rotate: 0 },
      },
    ],
  };
  readonly shapes: TxChartAnnotationShape[] = [
    { key: 'band', kind: 'band', color: 'red', x1: 0, y1: 0, x2: 10, y2: 10, label: null },
    { key: 'line', kind: 'line', color: 'red', x1: 0, y1: 0, x2: 0, y2: 10, label: null },
  ];
}

describe('chart svg parts', () => {
  it('draws axis lines, rotated titles and full label titles', async () => {
    const fixture = TestBed.createComponent(SvgHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('.tx-chart-axes__line')).toHaveLength(1);
    expect(root.querySelector('.tx-chart-axes__label title')?.textContent).toBe(
      'Long label in full',
    );
    expect(root.querySelector('.tx-chart-axes__label')?.getAttribute('transform')).toBe(
      'rotate(-45 10 20)',
    );
    const titles = [...root.querySelectorAll('.tx-chart-axes__title')];
    expect(titles.map((title) => title.getAttribute('transform'))).toEqual([
      'rotate(-90 5 50)',
      null,
    ]);
    expect(root.querySelectorAll('.all > *').length).toBeGreaterThan(
      root.querySelectorAll('.front > *').length,
    );
  });

  it('keeps the hover band on its last place while it fades and slides between places', async () => {
    const fixture = TestBed.createComponent(SvgHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const band = () =>
      fixture.nativeElement.querySelector('.tx-chart-hover-band') as SVGRectElement | null;
    expect(band()).toBeNull();
    fixture.componentInstance.band.set({ x: 10, y: 0, width: 20, height: 100 });
    await fixture.whenStable();
    expect(band()?.classList).toContain('tx-chart-hover-band--on');
    expect(band()?.classList).not.toContain('tx-chart-hover-band--slide');
    fixture.componentInstance.band.set({ x: 40, y: 0, width: 20, height: 100 });
    await fixture.whenStable();
    expect(band()?.classList).toContain('tx-chart-hover-band--slide');
    fixture.componentInstance.band.set(null);
    await fixture.whenStable();
    expect(band()?.getAttribute('x')).toBe('40');
    expect(band()?.classList).not.toContain('tx-chart-hover-band--on');
  });

  it('reports hover from static legend items', async () => {
    @Component({
      imports: [TxChartLegend],
      template: `<tx-chart-legend
        [items]="items"
        [toggle]="false"
        (hovered)="hovers.push($event)"
      />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class StaticHost {
      readonly items = [{ key: 'a', label: 'A', color: 'red' }];
      readonly hovers: (string | null)[] = [];
    }
    const fixture = TestBed.createComponent(StaticHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const item = fixture.nativeElement.querySelector('.tx-chart-legend__item') as HTMLElement;
    item.dispatchEvent(new MouseEvent('pointerenter'));
    item.dispatchEvent(new MouseEvent('pointerleave'));
    expect(fixture.componentInstance.hovers).toEqual(['a', null]);
  });
});

describe('TxChartMenu keys', () => {
  it('ignores other keys and a menu without enabled items', async () => {
    const fixture = TestBed.createComponent(TxChartMenu);
    fixture.componentRef.setInput('items', [{ id: 'a', label: 'Off', disabled: true }]);
    fixture.componentRef.setInput('unstyled', true);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const list = fixture.nativeElement.querySelector('[role="menu"]') as HTMLElement;
    expect(list.hasAttribute('aria-label')).toBe(false);
    expect(list.hasAttribute('data-styled')).toBe(false);
    const press = (key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      list.dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(press('Tab')).toBe(false);
    expect(press('ArrowDown')).toBe(false);
  });
});

@Component({
  selector: 'tx-entrance-probe',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EntranceProbe {
  readonly entrance = injectChartEntrance();
}

describe('chart entrance', () => {
  afterEach(() => {
    vi.useRealTimers();
    delete (window as unknown as Record<string, unknown>)['matchMedia'];
  });

  it('plays once on an empty host and stops after the animation', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(EntranceProbe);
    const entrance = fixture.componentInstance.entrance;
    expect(entrance.active()).toBe(true);
    entrance.play();
    vi.advanceTimersByTime(TX_CHART_ENTER_MS);
    expect(entrance.active()).toBe(false);
    fixture.destroy();
  });

  it('stays still when the user prefers less motion', () => {
    (window as unknown as Record<string, unknown>)['matchMedia'] = () => ({ matches: true });
    expect(prefersReducedMotion(document)).toBe(true);
    const fixture = TestBed.createComponent(EntranceProbe);
    expect(fixture.componentInstance.entrance.active()).toBe(false);
    expect(prefersReducedMotion(document.implementation.createHTMLDocument())).toBe(false);
  });

  it('does nothing on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const fixture = TestBed.createComponent(EntranceProbe);
    fixture.componentInstance.entrance.play();
    expect(fixture.componentInstance.entrance.active()).toBe(false);
  });
});
