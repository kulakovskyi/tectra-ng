import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  model,
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
  TxChartAnnotation,
  TxChartAnnotations,
  TxChartX,
  chartAnnotationShapes,
  chartCategoryIndex,
  toTime,
  prefersReducedMotion,
  readTokenNumber,
} from '@tectra-ng/charts/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
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
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { LINE_ICON_DEFAULTS } from './line.icons';
import { LINE_THEME } from './line.theme';

const DECIMATE_RATIO = 1.5;
const OVERVIEW = 44;
const OVERVIEW_GAP = 18;
const OVERVIEW_PAD = 4;
const OVERVIEW_HANDLE = 20;
const HANDLE_REACH = 7;
const DRAG_THRESHOLD = 3;
const CLIP_PAD = 8;
const MIN_CATEGORY_SPAN = 2;
const MIN_SPAN_SHARE = 0.02;
const KEY_ZOOM = 0.7;
const KEY_PAN = 0.2;
const SLIDE_SECONDS = 0.32;
const SLIDE_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

@Component({
  selector: 'tx-line-chart',
  imports: [TxChartFrame, TxChartAxes, TxChartAnnotations],
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
    '[class.tx-line-chart--live]': 'live()',
  },
  viewProviders: [provideTxIconDefaults(LINE_ICON_DEFAULTS)],
})
export class TxLineChart {
  private readonly lineTheme = injectTokens(LINE_THEME);

  private locale = inject(TxLocaleService);
  readonly translations = injectTranslations();

  readonly series = input<readonly TxChartSeries[] | null | undefined>([]);
  readonly categories = input<readonly (string | number | Date)[] | null | undefined>([]);
  readonly xType = input<TxChartXType>('category');
  readonly annotations = input<readonly TxChartAnnotation[] | null | undefined>([]);
  readonly zoom = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly brush = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly xRange = model<readonly [number, number] | null>(null);
  readonly maxPoints = input<number | undefined>(undefined);
  readonly live = input<boolean, unknown>(false, { transform: booleanAttribute });
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
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
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
  private readonly layer = viewChild<ElementRef<SVGGElement>>('layer');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

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
  readonly size = linkedSignal(() => initialChartSize(this.height(), this.legendShown() ? this.legendPosition() : null, undefined, this.toolbar()));

  private readonly intl = computed(() => this.locale.locale().intl);
  private readonly list = computed(() => this.series() ?? []);

  readonly fullTable = computed(() => {
    const categories = this.categories() ?? [];
    const fallback = this.xType() === 'category' && !categories.length && this.list().every((item) => item.data.every((value) => typeof value !== 'object'));
    const table = normalizeSeries(this.list(), fallback ? chartMonthNames(this.intl(), 'long') : categories, this.xType());
    const limit = this.maxPoints();
    if (!limit || limit < 2 || table.xs.length <= limit) return table;
    const from = table.xs.length - limit;
    return {
      labels: table.labels.slice(from),
      xs: this.xType() === 'category' ? table.xs.slice(from).map((_, index) => index) : table.xs.slice(from),
      values: table.values.map((row) => row.slice(from)),
    };
  });

  readonly zoomable = computed(() => this.zoom() || this.brush());

  readonly fullDomain = computed<[number, number]>(() => {
    const xs = this.fullTable().xs;
    return xs.length ? [xs[0], xs[xs.length - 1] === xs[0] ? xs[0] + 1 : xs[xs.length - 1]] : [0, 1];
  });

  readonly minSpan = computed(() => {
    const [from, to] = this.fullDomain();
    return this.xType() === 'category' ? Math.min(to - from, MIN_CATEGORY_SPAN) : (to - from) * MIN_SPAN_SHARE;
  });

  readonly view = computed<[number, number] | null>(() => {
    const range = this.xRange();
    if (!range || !this.zoomable()) return null;
    const [low, high] = this.fullDomain();
    const span = Math.max(this.minSpan(), Math.abs(range[1] - range[0]));
    let from = Math.max(low, Math.min(range[0], range[1]));
    let to = Math.min(high, from + span);
    from = Math.max(low, to - span);
    to = Math.min(high, from + span);
    return from <= low && to >= high ? null : [from, to];
  });

  private readonly windowed = computed(() => {
    const full = this.fullTable();
    const view = this.view();
    if (!view) return { table: full, start: 0 };
    const xs = full.xs;
    let start: number;
    let end: number;
    if (this.xType() === 'category') {
      start = Math.max(0, Math.floor(view[0]));
      end = Math.min(xs.length - 1, Math.ceil(view[1]));
    } else {
      const first = xs.findIndex((x) => x >= view[0]);
      const last = xs.length - 1 - [...xs].reverse().findIndex((x) => x <= view[1]);
      start = Math.max(0, (first < 0 ? xs.length - 1 : first) - 1);
      end = Math.min(xs.length - 1, (last >= xs.length ? 0 : last) + 1);
    }
    return {
      start,
      table: {
        labels: full.labels.slice(start, end + 1),
        xs: this.xType() === 'category' ? xs.slice(start, end + 1).map((_, index) => index) : xs.slice(start, end + 1),
        values: full.values.map((row) => row.slice(start, end + 1)),
      },
    };
  });

  readonly table = computed(() => this.windowed().table);
  readonly offset = computed(() => this.windowed().start);

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
    const { width } = this.size();
    const height = this.size().height - (this.brush() ? OVERVIEW + OVERVIEW_GAP : 0);
    const { xs } = this.table();
    const kind = this.xType() === 'category' ? 'point' : this.xType() === 'time' ? 'time' : 'linear';
    const view = this.view();
    const domain: [number, number] =
      view && this.xType() !== 'category' ? view : xs.length ? [xs[0], xs[xs.length - 1] === xs[0] ? xs[0] + 1 : xs[xs.length - 1]] : [0, 1];
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

  readonly clip = computed(() => {
    const plot = this.layout().plot;
    return { x: plot.left - CLIP_PAD, y: plot.top - CLIP_PAD, width: plot.width + CLIP_PAD * 2, height: plot.height + CLIP_PAD * 2 };
  });

  readonly clipped = computed(() => this.zoomable() || this.live());

  readonly overview = computed(() => {
    if (!this.brush() || this.isEmpty()) return null;
    const plot = this.layout().plot;
    const top = this.size().height - OVERVIEW;
    const full = this.fullTable();
    const [low, high] = this.fullDomain();
    const span = high - low || 1;
    const at = (u: number) => plot.left + ((u - low) / span) * plot.width;
    const seriesIndex = this.visibleIndexes()[0] ?? 0;
    const values = full.values[seriesIndex] ?? [];
    const range = extent(values) ?? [0, 1];
    const bottom = Math.min(0, range[0]);
    const peak = range[1] === bottom ? bottom + 1 : range[1];
    const points = values.map((value, index) => (value === null ? null : { x: at(full.xs[index]), y: top + OVERVIEW - OVERVIEW_PAD - ((value - bottom) / (peak - bottom)) * (OVERVIEW - OVERVIEW_PAD * 2) }));
    const base = points.map((point) => (point ? { x: point.x, y: top + OVERVIEW } : null));
    const [from, to] = this.view() ?? [low, high];
    return {
      top,
      height: OVERVIEW,
      left: plot.left,
      width: plot.width,
      line: linePath(points, this.curve()),
      area: areaPath(points, base, this.curve()),
      x0: at(from),
      x1: at(to),
      color: seriesColor(this.list()[seriesIndex]?.color, seriesIndex),
      handleY: top + (OVERVIEW - OVERVIEW_HANDLE) / 2,
      handleHeight: OVERVIEW_HANDLE,
    };
  });

  readonly annotationShapes = computed(() => {
    const layout = this.layout();
    return chartAnnotationShapes(this.annotations(), { plot: layout.plot, x: (value) => this.xPosition(value), y: (value) => layout.value.map(value) });
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
        if (raw === null || raw === undefined) return [];
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
    const values = this.fullTable().values.flat().filter((value): value is number => value !== null);
    const range = extent(values);
    const format = this.valueFormatter();
    const text = chartSummary(t, this.intl(), type, this.list().length, this.fullTable().xs.length, range ? [format(range[0]), format(range[1])] : null);
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() => {
    const format = this.valueFormatter();
    const full = this.fullTable();
    const time = this.timeLabel();
    return chartTable(
      time ? full.xs.map((x) => time(x)) : full.labels,
      this.list().map((item, index) => ({ name: item.name, values: full.values[index] })),
      format,
    );
  });

  private drag: { mode: 'pan' | 'move' | 'start' | 'end'; x: number; range: [number, number]; moved: boolean; overview: boolean } | null = null;
  private suppressClick = false;
  private anchor: { id: string; px: number } | null = null;

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
    afterRenderEffect(() => this.slide());
  }

  resetZoom(): void {
    this.active.set(null);
    this.xRange.set(null);
  }

  zoomAt(px: number, factor: number): void {
    const [low, high] = this.fullDomain();
    const current = this.view() ?? [low, high];
    const plot = this.layout().plot;
    const span = current[1] - current[0];
    const share = Math.max(0, Math.min(1, (px - plot.left) / Math.max(1, plot.width)));
    const at = current[0] + share * span;
    const next = Math.max(this.minSpan(), Math.min(high - low, span * factor));
    this.setRange([at - share * next, at - share * next + next]);
  }

  panBy(dx: number): void {
    const current = this.view();
    if (!current) return;
    const span = current[1] - current[0];
    const du = (-dx / Math.max(1, this.layout().plot.width)) * span;
    this.setRange([current[0] + du, current[1] + du]);
  }

  private setRange(range: [number, number]): void {
    const [low, high] = this.fullDomain();
    const span = Math.min(high - low, Math.max(this.minSpan(), range[1] - range[0]));
    const from = Math.max(low, Math.min(high - span, range[0]));
    this.active.set(null);
    this.xRange.set(from <= low && from + span >= high ? null : [from, from + span]);
  }

  private fromOverview(px: number): number {
    const overview = this.overview();
    const [low, high] = this.fullDomain();
    return overview ? low + ((px - overview.left) / Math.max(1, overview.width)) * (high - low) : low;
  }

  private handleDrag(event: TxChartPointerEvent): boolean {
    const overview = this.overview();
    const inOverview = !!overview && event.y >= overview.top - OVERVIEW_GAP / 2;
    if (event.type === 'down') {
      const current = this.view() ?? this.fullDomain();
      if (overview && inOverview) {
        const near = HANDLE_REACH;
        let range: [number, number] = [current[0], current[1]];
        let mode: 'move' | 'start' | 'end' = 'move';
        if (Math.abs(event.x - overview.x0) <= near) mode = 'start';
        else if (Math.abs(event.x - overview.x1) <= near) mode = 'end';
        else if (event.x < overview.x0 || event.x > overview.x1) {
          const centre = this.fromOverview(event.x);
          const span = current[1] - current[0];
          this.setRange([centre - span / 2, centre + span / 2]);
          range = this.view() ?? this.fullDomain();
        }
        this.drag = { mode, x: event.x, range, moved: false, overview: true };
        this.active.set(null);
        return true;
      }
      if (this.view()) this.drag = { mode: 'pan', x: event.x, range: [current[0], current[1]], moved: false, overview: false };
      return false;
    }
    if (event.type === 'move' && this.drag) {
      if (!((event.buttons ?? 0) & 1)) {
        this.drag = null;
        return false;
      }
      const drag = this.drag;
      const dx = event.x - drag.x;
      if (Math.abs(dx) > DRAG_THRESHOLD) drag.moved = true;
      if (!drag.moved) return drag.overview;
      const [from, to] = drag.range;
      if (drag.overview && overview) {
        const [low, high] = this.fullDomain();
        const du = (dx / Math.max(1, overview.width)) * (high - low);
        if (drag.mode === 'start') this.setRange([Math.min(from + du, to - this.minSpan()), to]);
        else if (drag.mode === 'end') this.setRange([from, Math.max(to + du, from + this.minSpan())]);
        else this.setRange([from + du, to + du]);
      } else {
        const du = (-dx / Math.max(1, this.layout().plot.width)) * (to - from);
        this.setRange([from + du, to + du]);
      }
      this.active.set(null);
      return true;
    }
    if (event.type === 'up') {
      const drag = this.drag;
      this.drag = null;
      if (drag?.moved) this.suppressClick = true;
      return !!drag?.overview || !!drag?.moved;
    }
    if (event.type === 'click' && (this.suppressClick || inOverview)) {
      this.suppressClick = false;
      return true;
    }
    return false;
  }

  private slide(): void {
    const table = this.table();
    const positions = this.xPositions();
    const live = this.live();
    const layer = this.layer()?.nativeElement;
    const last = table.xs.length - 1;
    if (last < 0) {
      this.anchor = null;
      return;
    }
    const identity = (index: number) => (this.xType() === 'category' ? table.labels[index] : String(table.xs[index]));
    const anchor = this.anchor;
    this.anchor = { id: identity(last), px: positions[last] };
    if (!live || !anchor || !layer || this.view() || prefersReducedMotion(this.host.nativeElement.ownerDocument)) return;
    let at = -1;
    for (let index = last; index >= 0; index--) {
      if (identity(index) === anchor.id) {
        at = index;
        break;
      }
    }
    if (at < 0 || at === last) return;
    const dx = anchor.px - positions[at];
    if (Math.abs(dx) < 0.5) return;
    const duration = readTokenNumber(this.host.nativeElement, '--tx-chart-motion-update-duration', SLIDE_SECONDS) * 1000;
    layer.animate([{ transform: `translateX(${dx}px)` }, { transform: 'translateX(0)' }], { duration, easing: SLIDE_EASING });
  }

  private xPosition(value: TxChartX): number | null {
    const layout = this.layout();
    const { xs } = this.table();
    if (this.xType() === 'category') {
      const index = chartCategoryIndex(value, this.fullTable().labels) - this.offset();
      return index < 0 || index >= xs.length ? null : layout.categoryPosition(index, xs[index]);
    }
    const x = this.xType() === 'time' ? toTime(value) : typeof value === 'number' ? value : Number(value);
    return x === null || !Number.isFinite(x) ? null : layout.categoryPosition(0, x);
  }

  pointValue(seriesIndex: number, index: number): number | null {
    const raw = this.table().values[seriesIndex]?.[index] ?? null;
    if (raw === null) return null;
    return this.isStacked() ? (this.stackedValues()[seriesIndex][index]?.[1] ?? null) : raw;
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.drag = null;
      this.active.set(null);
      return;
    }
    if (this.zoomable() && this.handleDrag(event)) return;
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
      this.pointClick.emit({ seriesIndex: series, dataPointIndex: index + this.offset(), value: this.table().values[series][index], category: this.labels()[index] ?? '' });
    }
  }

  onNavigate(event: KeyboardEvent): void {
    if (this.zoomable() && this.zoomKey(event)) return;
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

  private zoomKey(event: KeyboardEvent): boolean {
    const plot = this.layout().plot;
    const active = this.active();
    const focus = active ? (this.xPositions()[active.index] ?? plot.left + plot.width / 2) : plot.left + plot.width / 2;
    if (event.key === '+' || event.key === '=') this.zoomAt(focus, KEY_ZOOM);
    else if (event.key === '-' || event.key === '_') this.zoomAt(focus, 1 / KEY_ZOOM);
    else if (event.key === '0') this.resetZoom();
    else if (event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight') && this.view()) this.panBy((event.key === 'ArrowLeft' ? 1 : -1) * plot.width * KEY_PAN);
    else return false;
    this.active.set(null);
    return true;
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
