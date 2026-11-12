import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  TxChartActive,
  TxChartAxes,
  TxChartCurve,
  TxChartFrame,
  TxChartGridMode,
  TxChartHeight,
  TxChartLabelMode,
  TxChartLegendAlign,
  TxChartLegendItem,
  TxChartLegendPosition,
  TxChartLegendTemplate,
  TxChartLegendVariant,
  TxChartPointerEvent,
  TxChartTooltipData,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  areaPath,
  cartesianLayout,
  chartNumberFormatter,
  chartSummary,
  cycleIndex,
  extent,
  initialChartSize,
  injectChartEntrance,
  linePath,
  seriesColor,
  stepIndex,
  timeInterval,
  timeTooltipFormatter,
  toTime,
  toggleKey,
} from '@tectra-ng/charts/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxLocaleService, formatMessage, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxRangeAreaChartPart, TxRangeAreaPath, TxRangeAreaPointEvent, TxRangeAreaSeriesToggle, TxRangeAreaXType, TxRangeSeries } from './range-area-chart.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { RANGE_AREA_ICON_DEFAULTS } from './range-area.icons';
import { RANGE_AREA_THEME } from './range-area.theme';

const EDGE_SLACK = 8;

@Component({
  selector: 'tx-range-area-chart',
  imports: [TxChartFrame, TxChartAxes],
  templateUrl: './range-area-chart.component.html',
  styleUrl: './range-area-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-range-area-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-range-area-chart--fill]': 'typeof height() === "string"',
    '[class.tx-range-area-chart--entering]': 'entrance.active()',
    '[class.tx-range-area-chart--morph]': 'morph()',
    '[class.tx-range-area-chart--focused]': 'focusedSeries() !== null',
  },
  viewProviders: [provideTxIconDefaults(RANGE_AREA_ICON_DEFAULTS)],
})
export class TxRangeAreaChart {
  private readonly rangeAreaTheme = injectTokens(RANGE_AREA_THEME);

  private locale = inject(TxLocaleService);
  readonly translations = injectTranslations();

  readonly series = input<readonly TxRangeSeries[] | null | undefined>([]);
  readonly categories = input<readonly (string | number | Date)[] | null | undefined>([]);
  readonly xType = input<TxRangeAreaXType>('category');
  readonly height = input<TxChartHeight>(350);
  readonly curve = input<TxChartCurve>('smooth');
  readonly edges = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showLegend = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly legendPosition = input<TxChartLegendPosition>('top');
  readonly legendAlign = input<TxChartLegendAlign>('start');
  readonly legendVariant = input<TxChartLegendVariant>('line');
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly yMin = input<number | undefined>(undefined);
  readonly yMax = input<number | undefined>(undefined);
  readonly xAxisTitle = input('');
  readonly yAxisTitle = input('');
  readonly grid = input<TxChartGridMode>('value');
  readonly labelMode = input<TxChartLabelMode>('auto');
  readonly maxLabels = input(10);
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxRangeAreaChartPart, TxRangeAreaChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly seriesToggle = output<TxRangeAreaSeriesToggle>();
  readonly pointClick = output<TxRangeAreaPointEvent>();

  readonly legendTemplate = contentChild(TxChartLegendTemplate);
  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('rangeAreaChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);

  readonly hidden = signal<ReadonlySet<string>>(new Set());
  readonly focusedSeries = signal<number | null>(null);
  readonly active = signal<TxChartActive | null>(null);

  private readonly intl = computed(() => this.locale.locale().intl);
  private readonly list = computed(() => this.series() ?? []);
  readonly count = computed(() => Math.max(0, ...this.list().map((item) => Math.max(item.low.length, item.high.length, item.line?.length ?? 0))));
  readonly xs = computed(() => {
    const categories = this.categories() ?? [];
    return Array.from({ length: this.count() }, (_, index) => (this.xType() === 'time' ? (toTime(categories[index]) ?? index) : index));
  });
  readonly timeLabel = computed(() => {
    const xs = this.xs();
    if (this.xType() !== 'time' || !xs.length) return null;
    return timeTooltipFormatter(this.intl(), timeInterval(xs[0], xs[xs.length - 1], Math.max(2, Math.min(12, xs.length))));
  });
  readonly labels = computed(() => {
    const format = this.timeLabel();
    const categories = this.categories() ?? [];
    return this.xs().map((x, index) => (format ? format(x) : String(categories[index] ?? index + 1)));
  });
  readonly keys = computed(() => this.list().map((item, index) => `${index}:${item.name}`));
  readonly visibleIndexes = computed(() => this.keys().flatMap((key, index) => (this.hidden().has(key) ? [] : [index])));
  readonly isEmpty = computed(() => !this.list().some((item) => [...item.low, ...item.high, ...(item.line ?? [])].some((value) => value !== null && Number.isFinite(value))));
  readonly legendShown = computed(() => this.showLegend() && this.list().length > 1);
  readonly size = linkedSignal(() => initialChartSize(this.height(), this.legendShown() ? this.legendPosition() : null, undefined, this.toolbar()));

  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const xs = this.xs();
    const time = this.xType() === 'time';
    const values = this.visibleIndexes().flatMap((index) => {
      const item = this.list()[index];
      return [...item.low, ...item.high, ...(item.line ?? [])];
    });
    return cartesianLayout({
      width,
      height,
      intl: this.intl(),
      category: {
        kind: time ? 'time' : 'point',
        labels: this.labels(),
        count: xs.length,
        domain: xs.length ? [xs[0], xs[xs.length - 1] === xs[0] ? xs[0] + 1 : xs[xs.length - 1]] : [0, 1],
        labelMode: this.labelMode(),
        maxLabels: this.maxLabels(),
        title: this.xAxisTitle() || undefined,
      },
      value: { extent: extent(values) ?? [0, 1], format: this.valueFormat(), includeZero: false, min: this.yMin(), max: this.yMax(), title: this.yAxisTitle() || undefined },
      grid: this.grid(),
    });
  });

  readonly positions = computed(() => {
    const layout = this.layout();
    return this.xs().map((x, index) => layout.categoryPosition(index, x));
  });

  readonly paths = computed<TxRangeAreaPath[]>(() => {
    const scale = this.layout().value;
    const xs = this.positions();
    const curve = this.curve();
    const at = (values: readonly (number | null)[]) => xs.map((x, index) => (values[index] === null || values[index] === undefined ? null : { x, y: scale.map(values[index] as number) }));
    return this.visibleIndexes().map((seriesIndex) => {
      const item = this.list()[seriesIndex];
      const high = xs.map((x, index) => (item.low[index] === null || item.high[index] === null || item.low[index] === undefined || item.high[index] === undefined ? null : { x, y: scale.map(item.high[index] as number) }));
      const low = xs.map((x, index) => (high[index] ? { x, y: scale.map(item.low[index] as number) } : null));
      return {
        index: seriesIndex,
        key: this.keys()[seriesIndex],
        color: seriesColor(item.color, seriesIndex),
        band: areaPath(high, low, curve),
        low: linePath(low, curve),
        high: linePath(high, curve),
        line: item.line ? linePath(at(item.line), curve) : '',
      };
    });
  });

  readonly crosshair = computed(() => {
    const active = this.active();
    if (!active) return null;
    const plot = this.layout().plot;
    return { x: this.positions()[active.index], y1: plot.top, y2: plot.top + plot.height };
  });

  readonly activePoints = computed(() => {
    const active = this.active();
    if (!active) return [];
    const scale = this.layout().value;
    const x = this.positions()[active.index];
    return this.visibleIndexes().flatMap((seriesIndex) => {
      const item = this.list()[seriesIndex];
      const color = seriesColor(item.color, seriesIndex);
      const points: { key: string; x: number; y: number; color: string; main: boolean }[] = [];
      const line = item.line?.[active.index];
      if (line !== null && line !== undefined) points.push({ key: `${seriesIndex}:line`, x, y: scale.map(line), color, main: true });
      for (const [name, value] of [['low', item.low[active.index]], ['high', item.high[active.index]]] as const) {
        if (value !== null && value !== undefined) points.push({ key: `${seriesIndex}:${name}`, x, y: scale.map(value), color, main: false });
      }
      return points;
    });
  });

  readonly legendItems = computed<TxChartLegendItem[]>(() =>
    this.list().map((item, index) => ({ key: this.keys()[index], label: item.name, color: seriesColor(item.color, index), hidden: this.hidden().has(this.keys()[index]) })),
  );

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const active = this.active();
    if (!active || !this.showTooltip()) return null;
    const format = this.valueFormatter();
    const rows = this.visibleIndexes().flatMap((seriesIndex) => {
      const item = this.list()[seriesIndex];
      const low = item.low[active.index] ?? null;
      const high = item.high[active.index] ?? null;
      const line = item.line?.[active.index] ?? null;
      if (low === null && high === null && line === null) return [];
      const range = low !== null && high !== null ? `${format(low)} – ${format(high)}` : '';
      return [
        {
          label: item.name,
          value: line !== null ? format(line) : range,
          share: line !== null ? range : undefined,
          color: seriesColor(item.color, seriesIndex),
          raw: line,
          seriesIndex,
          active: seriesIndex === active.series,
        },
      ];
    });
    if (!rows.length) return null;
    return { title: this.labels()[active.index] ?? '', rows, index: active.index, x: this.positions()[active.index], y: this.layout().plot.top, placement: 'top' };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const values = this.list().flatMap((item) => [...item.low, ...item.high]);
    const range = extent(values);
    const format = this.valueFormatter();
    const text = chartSummary(t, this.intl(), t.chartRangeArea, this.list().length, this.count(), range ? [format(range[0]), format(range[1])] : null);
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() => {
    const t = this.translations();
    const format = this.valueFormatter();
    const cell = (value: number | null | undefined) => (value === null || value === undefined ? '—' : format(value));
    const many = this.list().length > 1;
    return {
      columns: this.list().flatMap((item, index) => [
        { key: `${index}:low`, label: many ? `${item.name}, ${t.chartLow}` : t.chartLow },
        ...(item.line ? [{ key: `${index}:line`, label: item.name }] : []),
        { key: `${index}:high`, label: many ? `${item.name}, ${t.chartHigh}` : t.chartHigh },
      ]),
      rows: this.labels().map((label, index) => ({
        label,
        cells: this.list().flatMap((item) => [cell(item.low[index]), ...(item.line ? [cell(item.line[index])] : []), cell(item.high[index])]),
      })),
    };
  });

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.active.set(null);
      return;
    }
    const plot = this.layout().plot;
    if (event.x < plot.left - EDGE_SLACK || event.x > plot.left + plot.width + EDGE_SLACK || event.y < plot.top - EDGE_SLACK || event.y > plot.top + plot.height + EDGE_SLACK) {
      this.active.set(null);
      return;
    }
    const index = this.layout().categoryIndexAt(event.x, this.xs());
    if (index < 0) return;
    const series = this.nearestSeries(index, event.y);
    this.active.set({ index, series, pointerY: event.y, keyboard: false });
    if (event.type === 'click' && series >= 0) this.pointClick.emit(this.event(series, index));
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.active.set(null);
      return;
    }
    const visible = this.visibleIndexes();
    const current = this.active();
    let index = current?.index ?? -1;
    let series = current?.series ?? visible[0] ?? -1;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      series = cycleIndex(series, event.key === 'ArrowDown' ? 1 : -1, visible);
      index = Math.max(0, index);
    } else {
      index = stepIndex(event.key, index, this.count());
    }
    if (index < 0 || series < 0) return;
    this.active.set({ index, series, pointerY: null, keyboard: true });
    const item = this.list()[series];
    const format = this.valueFormatter();
    const low = item.low[index];
    const high = item.high[index];
    const line = item.line?.[index];
    const value = [line !== null && line !== undefined ? format(line) : '', low !== null && low !== undefined && high !== null && high !== undefined ? `${format(low)} – ${format(high)}` : '']
      .filter(Boolean)
      .join(', ');
    this.frame()?.announce(formatMessage(this.translations().chartPoint, { series: item.name, category: this.labels()[index] ?? '', value: value || '—' }));
  }

  onLegendToggle(key: string): void {
    const index = this.keys().indexOf(key);
    this.hidden.update((keys) => toggleKey(keys, key));
    this.seriesToggle.emit({ seriesIndex: index, name: this.list()[index]?.name ?? '', hidden: this.hidden().has(key) });
  }

  onLegendHover(key: string | null): void {
    const index = key === null ? -1 : this.keys().indexOf(key);
    this.focusedSeries.set(index >= 0 && !this.hidden().has(key ?? '') ? index : null);
  }

  private event(series: number, index: number): TxRangeAreaPointEvent {
    const item = this.list()[series];
    return { seriesIndex: series, dataPointIndex: index, category: this.labels()[index] ?? '', low: item.low[index] ?? null, high: item.high[index] ?? null, line: item.line?.[index] ?? null };
  }

  private nearestSeries(index: number, y: number): number {
    const scale = this.layout().value;
    let best = this.visibleIndexes()[0] ?? -1;
    let distance = Infinity;
    for (const seriesIndex of this.visibleIndexes()) {
      const item = this.list()[seriesIndex];
      const low = item.low[index];
      const high = item.high[index];
      if (low === null || low === undefined || high === null || high === undefined) continue;
      const top = scale.map(high);
      const bottom = scale.map(low);
      const next = y >= top && y <= bottom ? 0 : Math.min(Math.abs(y - top), Math.abs(y - bottom));
      if (next < distance) {
        distance = next;
        best = seriesIndex;
      }
    }
    return best;
  }
}
