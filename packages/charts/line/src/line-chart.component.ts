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
  TxChartSeries,
  TxChartTooltipData,
  TxChartTooltipFormatter,
  TxChartTooltipMode,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  TxChartXAxisPosition,
  TxChartYAxisPosition,
  TxChartXType,
  TxValueScaleKind,
  areaPath,
  cartesianLayout,
  chartNumberFormatter,
  chartMonthNames,
  chartSummary,
  chartTable,
  cycleIndex,
  decimateSeries,
  extent,
  hasChartData,
  initialChartSize,
  injectChartEntrance,
  linePath,
  normalizeSeries,
  seriesColor,
  stackValues,
  stepIndex,
  timeInterval,
  timeTooltipFormatter,
  toggleKey,
} from '@tectra-ng/charts/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, formatMessage, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import {
  TxLineChartCurve,
  TxLineChartPart,
  TxLineChartPath,
  TxLineChartPointEvent,
  TxLineChartSeriesToggle,
  TxLineChartStackType,
} from './line-chart.types';

const DECIMATE_RATIO = 1.5;

@Component({
  selector: 'tx-line-chart',
  imports: [TxChartFrame, TxChartAxes],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-line-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-curve]': 'curve()',
    '[class.tx-line-chart--area]': 'area()',
    '[class.tx-line-chart--fill]': 'typeof height() === "string"',
    '[class.tx-line-chart--entering]': 'entrance.active()',
    '[class.tx-line-chart--morph]': 'morph()',
    '[class.tx-line-chart--focused]': 'focusedSeries() !== null',
  },
})
export class TxLineChart {
  private locale = inject(TxLocaleService);
  readonly translations = injectTranslations();

  readonly series = input<readonly TxChartSeries[] | null | undefined>([]);
  readonly categories = input<readonly (string | number | Date)[] | null | undefined>([]);
  readonly xType = input<TxChartXType>('category');
  readonly height = input<TxChartHeight>(450);
  readonly curve = input<TxLineChartCurve>('smooth');
  readonly area = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly stacked = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly stackType = input<TxLineChartStackType>('normal');
  readonly markers = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showLegend = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly legendPosition = input<TxChartLegendPosition>('top');
  readonly legendAlign = input<TxChartLegendAlign>('start');
  readonly legendVariant = input<TxChartLegendVariant>('line');
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly tooltipMode = input<TxChartTooltipMode>('shared');
  readonly tooltipFormatter = input<TxChartTooltipFormatter | null>(null);
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly yScale = input<TxValueScaleKind>('linear');
  readonly yMin = input<number | undefined>(undefined);
  readonly yMax = input<number | undefined>(undefined);
  readonly xAxisTitle = input('');
  readonly yAxisTitle = input('');
  readonly grid = input<TxChartGridMode>('value');
  readonly xAxisPosition = input<TxChartXAxisPosition>('bottom');
  readonly yAxisPosition = input<TxChartYAxisPosition>('left');
  readonly labelMode = input<TxChartLabelMode>('auto');
  readonly maxLabels = input(10);
  readonly decimation = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxLineChartPart, TxLineChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly seriesToggle = output<TxLineChartSeriesToggle>();
  readonly pointClick = output<TxLineChartPointEvent>();

  readonly legendTemplate = contentChild(TxChartLegendTemplate);
  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('lineChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);

  readonly uid = uniqueId('tx-line-chart');
  readonly hidden = signal<ReadonlySet<string>>(new Set());
  readonly focusedSeries = signal<number | null>(null);
  readonly active = signal<TxChartActive | null>(null);
  readonly size = linkedSignal(() => initialChartSize(this.height(), this.legendShown() ? this.legendPosition() : null));

  private readonly intl = computed(() => this.locale.locale().intl);
  private readonly list = computed(() => this.series() ?? []);

  readonly table = computed(() => {
    const categories = this.categories() ?? [];
    const fallback = this.xType() === 'category' && !categories.length && this.list().every((item) => item.data.every((value) => typeof value !== 'object'));
    return normalizeSeries(this.list(), fallback ? chartMonthNames(this.intl(), 'long') : categories, this.xType());
  });

  readonly keys = computed(() => this.list().map((item, index) => `${index}:${item.name}`));
  readonly visibleIndexes = computed(() => this.keys().flatMap((key, index) => (this.hidden().has(key) ? [] : [index])));
  readonly isEmpty = computed(() => !this.list().length || !hasChartData(this.table().values));
  readonly isStacked = computed(() => this.stacked() || this.stackType() === '100%');
  readonly legendShown = computed(() => this.showLegend() && this.list().length > 1);

  readonly stackedValues = computed(() => {
    const values = this.table().values;
    const visible = new Set(this.visibleIndexes());
    const rows = values.map((row, index) => (visible.has(index) ? row : row.map(() => null)));
    return stackValues(rows, this.stackType());
  });

  readonly valueExtent = computed<[number, number]>(() => {
    const visible = this.visibleIndexes();
    if (this.isStacked()) {
      const all = this.stackedValues().flatMap((row, index) => (visible.includes(index) ? row.flatMap((value) => (value ? [value[0], value[1]] : [])) : []));
      return extent(all) ?? [0, 1];
    }
    return extent(visible.flatMap((index) => this.table().values[index])) ?? [0, 1];
  });

  readonly axisFormat = computed<TxChartValueFormat>(() => (this.stackType() === '100%' && this.isStacked() && this.valueFormat() === 'number' ? 'percent' : this.valueFormat()));

  readonly timeLabel = computed(() => {
    const xs = this.table().xs;
    if (this.xType() !== 'time' || xs.length < 1) {
      return null;
    }
    return timeTooltipFormatter(this.intl(), timeInterval(xs[0], xs[xs.length - 1], Math.max(2, Math.min(12, xs.length))));
  });

  readonly labels = computed(() => {
    const format = this.timeLabel();
    const { labels, xs } = this.table();
    return format ? xs.map((x) => format(x)) : labels;
  });

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const { xs } = this.table();
    const kind = this.xType() === 'category' ? 'point' : this.xType() === 'time' ? 'time' : 'linear';
    const domain: [number, number] = xs.length ? [xs[0], xs[xs.length - 1] === xs[0] ? xs[0] + 1 : xs[xs.length - 1]] : [0, 1];
    return cartesianLayout({
      width,
      height,
      intl: this.intl(),
      category: {
        kind,
        labels: this.table().labels,
        count: xs.length,
        domain,
        labelMode: this.labelMode(),
        maxLabels: this.maxLabels(),
        title: this.xAxisTitle() || undefined,
      },
      value: {
        extent: this.valueExtent(),
        scale: this.yScale(),
        format: this.axisFormat(),
        includeZero: this.area() || this.isStacked(),
        min: this.isStacked() && this.stackType() === '100%' ? 0 : this.yMin(),
        max: this.isStacked() && this.stackType() === '100%' ? 100 : this.yMax(),
        title: this.yAxisTitle() || undefined,
      },
      grid: this.grid(),
      xAxisPosition: this.xAxisPosition(),
      yAxisPosition: this.yAxisPosition(),
    });
  });

  readonly xPositions = computed(() => {
    const layout = this.layout();
    const { xs } = this.table();
    return xs.map((x, index) => layout.categoryPosition(index, x));
  });

  readonly paths = computed<TxLineChartPath[]>(() => {
    const layout = this.layout();
    const xs = this.xPositions();
    const { values } = this.table();
    const stacked = this.isStacked();
    const stackedValues = this.stackedValues();
    const visible = this.visibleIndexes();
    const scale = layout.value;
    const base = scale.map(scale.domain[0] <= 0 && scale.domain[1] >= 0 ? 0 : scale.domain[0]);
    const threshold = Math.max(16, Math.round(layout.plot.width * DECIMATE_RATIO));
    const curve = this.curve();
    return visible.map((seriesIndex) => {
      const item = this.list()[seriesIndex];
      const top = values[seriesIndex].map((value, index) => {
        if (value === null) return null;
        const y = stacked ? (stackedValues[seriesIndex][index]?.[1] ?? null) : value;
        return y === null ? null : { x: xs[index], y: scale.map(y) };
      });
      const bottom = values[seriesIndex].map((value, index) => {
        if (value === null) return null;
        const y0 = stacked ? (stackedValues[seriesIndex][index]?.[0] ?? 0) : null;
        return { x: xs[index], y: y0 === null ? base : scale.map(y0) };
      });
      const thin = this.decimation() && top.length > threshold;
      const sampled = thin ? decimateSeries(top, threshold) : null;
      const drawnTop = sampled ?? top;
      const drawnBottom = sampled ? sampled.map((point) => (point ? (bottom[point.index] ?? null) : null)) : bottom;
      const showMarkers = this.markers() && top.length <= layout.plot.width / 6;
      return {
        index: seriesIndex,
        key: this.keys()[seriesIndex],
        name: item.name,
        color: seriesColor(item.color, seriesIndex),
        line: linePath(drawnTop, curve),
        area: this.area() ? areaPath(drawnTop, drawnBottom, curve) : '',
        markers: showMarkers ? top.flatMap((point, index) => (point ? [{ x: point.x, y: point.y, index }] : [])) : [],
        gradient: `${this.uid}-fill-${seriesIndex}`,
      };
    });
  });

  readonly legendItems = computed<TxChartLegendItem[]>(() => {
    const stat = this.legendVariant() === 'stat';
    const active = this.active();
    const format = this.formatValue();
    return this.list().map((item, index) => {
      const values = this.table().values[index] ?? [];
      let at = active?.index ?? -1;
      if (stat && at < 0) {
        for (let cursor = values.length - 1; cursor >= 0; cursor--) {
          if (values[cursor] !== null) {
            at = cursor;
            break;
          }
        }
      }
      const raw = at >= 0 ? values[at] : null;
      return {
        key: this.keys()[index],
        label: item.name,
        color: seriesColor(item.color, index),
        hidden: this.hidden().has(this.keys()[index]),
        ...(stat ? { value: raw === null || raw === undefined ? '—' : format(raw, index, at), caption: at >= 0 ? this.labels()[at] : undefined } : {}),
      };
    });
  });

  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat() === 'number' ? 'integer' : this.valueFormat()));

  readonly formatValue = computed(() => {
    const custom = this.tooltipFormatter();
    const format = this.valueFormatter();
    return (value: number, seriesIndex: number, dataPointIndex: number) => (custom ? custom(value, { seriesIndex, dataPointIndex }) : format(value));
  });

  readonly crosshair = computed(() => {
    const active = this.active();
    if (!active) return null;
    const x = this.xPositions()[active.index];
    const plot = this.layout().plot;
    return x === undefined ? null : { x, y1: plot.top, y2: plot.top + plot.height };
  });

  readonly activePoints = computed(() => {
    const active = this.active();
    if (!active) return [];
    const scale = this.layout().value;
    const x = this.xPositions()[active.index];
    return this.visibleIndexes().flatMap((seriesIndex) => {
      const value = this.pointValue(seriesIndex, active.index);
      if (value === null || (this.tooltipMode() === 'single' && seriesIndex !== active.series)) return [];
      return [{ x, y: scale.map(value), color: seriesColor(this.list()[seriesIndex].color, seriesIndex), series: seriesIndex }];
    });
  });

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const active = this.active();
    if (!active || !this.showTooltip() || this.isEmpty() || this.legendVariant() === 'stat') return null;
    const format = this.formatValue();
    const rows = this.visibleIndexes()
      .filter((seriesIndex) => this.tooltipMode() === 'shared' || seriesIndex === active.series)
      .flatMap((seriesIndex) => {
        const raw = this.table().values[seriesIndex][active.index];
        if (raw === null) return [];
        return [
          {
            label: this.list()[seriesIndex].name,
            value: format(raw, seriesIndex, active.index),
            color: seriesColor(this.list()[seriesIndex].color, seriesIndex),
            raw,
            seriesIndex,
            active: seriesIndex === active.series,
          },
        ];
      });
    if (!rows.length) return null;
    const points = this.activePoints();
    const x = this.xPositions()[active.index];
    const single = this.tooltipMode() === 'single';
    const y = single ? (points.find((point) => point.series === active.series)?.y ?? this.layout().plot.top) : this.layout().plot.top;
    const total = this.isStacked() && rows.length > 1 ? this.valueFormatter()(rows.reduce((sum, row) => sum + (row.raw ?? 0), 0)) : undefined;
    return { title: this.labels()[active.index] ?? '', rows, index: active.index, x, y, placement: 'top', total };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const type = this.area() ? t.chartArea : t.chartLine;
    const values = this.table().values.flat().filter((value): value is number => value !== null);
    const range = extent(values);
    const format = this.valueFormatter();
    const text = chartSummary(t, this.intl(), type, this.list().length, this.table().xs.length, range ? [format(range[0]), format(range[1])] : null);
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() => {
    const format = this.valueFormatter();
    return chartTable(
      this.labels(),
      this.list().map((item, index) => ({ name: item.name, values: this.table().values[index] })),
      format,
    );
  });

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
  }

  pointValue(seriesIndex: number, index: number): number | null {
    const raw = this.table().values[seriesIndex]?.[index] ?? null;
    if (raw === null) return null;
    return this.isStacked() ? (this.stackedValues()[seriesIndex][index]?.[1] ?? null) : raw;
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.active.set(null);
      return;
    }
    const plot = this.layout().plot;
    if (event.x < plot.left - 8 || event.x > plot.left + plot.width + 8 || event.y < plot.top - 8 || event.y > plot.top + plot.height + 8) {
      this.active.set(null);
      return;
    }
    const index = this.layout().categoryIndexAt(event.x, this.table().xs);
    if (index < 0) return;
    const series = this.nearestSeries(index, event.y);
    this.active.set({ index, series, pointerY: event.y, keyboard: false });
    if (event.type === 'click' && series >= 0) {
      this.pointClick.emit({ seriesIndex: series, dataPointIndex: index, value: this.table().values[series][index], category: this.labels()[index] ?? '' });
    }
  }

  onNavigate(event: KeyboardEvent): void {
    const count = this.table().xs.length;
    const current = this.active();
    if (event.key === 'Escape') {
      this.active.set(null);
      return;
    }
    const visible = this.visibleIndexes();
    let index = current?.index ?? -1;
    let series = current?.series ?? visible[0] ?? -1;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      series = cycleIndex(series, event.key === 'ArrowDown' ? 1 : -1, visible);
      index = Math.max(0, index);
    } else {
      index = stepIndex(event.key, index, count);
    }
    if (index < 0 || series < 0) return;
    this.active.set({ index, series, pointerY: null, keyboard: true });
    const value = this.table().values[series][index];
    this.frame()?.announce(
      formatMessage(this.translations().chartPoint, {
        series: this.list()[series].name,
        category: this.labels()[index] ?? '',
        value: value === null ? '—' : this.formatValue()(value, series, index),
      }),
    );
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

  private nearestSeries(index: number, y: number): number {
    const scale = this.layout().value;
    let best = this.visibleIndexes()[0] ?? -1;
    let distance = Infinity;
    for (const seriesIndex of this.visibleIndexes()) {
      const value = this.pointValue(seriesIndex, index);
      if (value === null) continue;
      const next = Math.abs(scale.map(value) - y);
      if (next < distance) {
        distance = next;
        best = seriesIndex;
      }
    }
    return best;
  }
}
