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
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  TX_CHART_TABLE_ROWS,
  TxChartActive,
  TxChartAxes,
  TxChartFrame,
  TxChartGridMode,
  TxChartHeight,
  TxChartLegendAlign,
  TxChartLegendItem,
  TxChartLegendPosition,
  TxChartLegendTemplate,
  TxChartLegendVariant,
  TxChartPointerEvent,
  TxChartTable,
  TxChartTooltipData,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  TxChartXAxisPosition,
  TxChartYAxisPosition,
  TxRange,
  TxValueScaleKind,
  cartesianLayout,
  chartNumberFormatter,
  chartSummary,
  cycleIndex,
  extent,
  initialChartSize,
  injectChartEntrance,
  niceDomain,
  readTokenNumber,
  seriesColor,
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
import { bubbleRadius, linearTrend, nearestDot, scatterData } from './scatter-layout';
import {
  TxScatterChartDot,
  TxScatterChartPart,
  TxScatterChartPointEvent,
  TxScatterChartSeriesToggle,
  TxScatterChartTrend,
  TxScatterChartXType,
  TxScatterDatum,
  TxScatterSeries,
} from './scatter-chart.types';

const DEFAULT_RADIUS = { point: 5, min: 4, max: 26 };
const HIT_SLACK = 8;
const STAGGER_GROUPS = 24;
const BUBBLE_PLOT_SHARE = 0.8;

@Component({
  selector: 'tx-scatter-chart',
  imports: [TxChartFrame, TxChartAxes],
  templateUrl: './scatter-chart.component.html',
  styleUrl: './scatter-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-scatter-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-scatter-chart--bubble]': 'isBubble()',
    '[class.tx-scatter-chart--fill]': 'typeof height() === "string"',
    '[class.tx-scatter-chart--entering]': 'entrance.active()',
    '[class.tx-scatter-chart--morph]': 'morph()',
    '[class.tx-scatter-chart--focused]': 'focusedSeries() !== null',
    '[class.tx-scatter-chart--active]': 'active() !== null',
  },
})
export class TxScatterChart {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly series = input<readonly TxScatterSeries[] | null | undefined>([]);
  readonly xType = input<TxScatterChartXType>('linear');
  readonly height = input<TxChartHeight>(350);
  readonly trendLine = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showLegend = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly legendPosition = input<TxChartLegendPosition>('top');
  readonly legendAlign = input<TxChartLegendAlign>('start');
  readonly legendVariant = input<TxChartLegendVariant>('dot');
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly xValueFormat = input<TxChartValueFormat>('number');
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly sizeFormat = input<TxChartValueFormat>('number');
  readonly yScale = input<TxValueScaleKind>('linear');
  readonly xMin = input<number | undefined>(undefined);
  readonly xMax = input<number | undefined>(undefined);
  readonly yMin = input<number | undefined>(undefined);
  readonly yMax = input<number | undefined>(undefined);
  readonly xAxisTitle = input('');
  readonly yAxisTitle = input('');
  readonly sizeLabel = input('');
  readonly grid = input<TxChartGridMode>('both');
  readonly xAxisPosition = input<TxChartXAxisPosition>('bottom');
  readonly yAxisPosition = input<TxChartYAxisPosition>('left');
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxScatterChartPart, TxScatterChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly seriesToggle = output<TxScatterChartSeriesToggle>();
  readonly pointClick = output<TxScatterChartPointEvent>();

  readonly legendTemplate = contentChild(TxChartLegendTemplate);
  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('scatterChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);

  readonly uid = uniqueId('tx-scatter-chart');
  readonly hidden = signal<ReadonlySet<string>>(new Set());
  readonly focusedSeries = signal<number | null>(null);
  readonly active = signal<TxChartActive | null>(null);
  readonly radius = signal(DEFAULT_RADIUS);

  private readonly intl = computed(() => this.locale.locale().intl);
  private readonly list = computed(() => this.series() ?? []);

  readonly data = computed(() => scatterData(this.list()));
  readonly keys = computed(() => this.list().map((item, index) => `${index}:${item.name}`));
  readonly visibleIndexes = computed(() => this.keys().flatMap((key, index) => (this.hidden().has(key) ? [] : [index])));
  readonly visibleData = computed(() => this.visibleIndexes().flatMap((index) => this.data()[index] ?? []));
  readonly isBubble = computed(() => this.data().some((points) => points.some((point) => point.size !== null)));
  readonly isEmpty = computed(() => !this.data().some((points) => points.length));
  readonly legendShown = computed(() => this.showLegend() && this.list().length > 1);
  readonly size = linkedSignal(() => initialChartSize(this.height(), this.legendShown() ? this.legendPosition() : null, undefined, this.toolbar()));
  readonly order = computed(() => this.data().map((points) => points.map((_, position) => position).sort((a, b) => points[a].x - points[b].x || points[a].y - points[b].y)));
  readonly maxSize = computed(() => Math.max(0, ...this.data().flatMap((points) => points.map((point) => point.size ?? 0))));

  readonly xDomain = computed<TxRange>(() => {
    const range = extent(this.visibleData().map((point) => point.x)) ?? extent(this.data().flat().map((point) => point.x)) ?? [0, 1];
    if (this.xType() === 'time') {
      const [from, to] = range;
      return [this.xMin() ?? from, this.xMax() ?? (to === from ? from + 86_400_000 : to)];
    }
    const [from, to] = padRange(range, this.bubblePad(range, this.size().width));
    const nice = niceDomain(from, to, 6);
    return [this.xMin() ?? nice[0], this.xMax() ?? nice[1]];
  });

  readonly yExtent = computed<TxRange>(() => {
    const range = extent(this.visibleData().map((point) => point.y)) ?? [0, 1];
    if (this.yScale() === 'log') return range;
    return padRange(range, this.bubblePad(range, this.size().height));
  });

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const format = this.xValueFormat();
    return cartesianLayout({
      width,
      height,
      intl: this.intl(),
      category: {
        kind: this.xType() === 'time' ? 'time' : 'linear',
        domain: this.xDomain(),
        format: this.xType() === 'linear' && format !== 'number' ? chartNumberFormatter(this.intl(), format) : undefined,
        title: this.xAxisTitle() || undefined,
      },
      value: {
        extent: this.yExtent(),
        scale: this.yScale(),
        format: this.valueFormat(),
        includeZero: false,
        min: this.yMin(),
        max: this.yMax(),
        title: this.yAxisTitle() || undefined,
      },
      grid: this.grid(),
      xAxisPosition: this.xAxisPosition(),
      yAxisPosition: this.yAxisPosition(),
    });
  });

  readonly formatX = computed(() => {
    if (this.xType() === 'time') {
      const [from, to] = this.xDomain();
      return timeTooltipFormatter(this.intl(), timeInterval(from, to, 6));
    }
    return chartNumberFormatter(this.intl(), this.xValueFormat());
  });
  readonly formatY = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));
  readonly formatSize = computed(() => chartNumberFormatter(this.intl(), this.sizeFormat()));

  readonly dots = computed<TxScatterChartDot[]>(() => {
    const layout = this.layout();
    const radius = this.radius();
    const bubble = this.isBubble();
    const maxSize = this.maxSize();
    return this.visibleIndexes().flatMap((seriesIndex) => {
      const color = seriesColor(this.list()[seriesIndex].color, seriesIndex);
      return this.data()[seriesIndex].map((point, position) => ({
        key: `${seriesIndex}:${point.index}`,
        series: seriesIndex,
        index: position,
        cx: layout.categoryPosition(position, point.x),
        cy: layout.value.map(point.y),
        r: bubble ? bubbleRadius(point.size, maxSize, radius.min, radius.max) : radius.point,
        color: point.color ?? color,
        order: position % STAGGER_GROUPS,
      }));
    });
  });

  readonly drawnDots = computed(() => (this.isBubble() ? [...this.dots()].sort((a, b) => b.r - a.r) : this.dots()));

  readonly trends = computed<TxScatterChartTrend[]>(() => {
    if (!this.trendLine()) return [];
    const layout = this.layout();
    return this.visibleIndexes().flatMap((seriesIndex) => {
      const fit = linearTrend(this.data()[seriesIndex]);
      if (!fit) return [];
      const at = (x: number) => ({ x: layout.categoryPosition(0, x), y: layout.value.map(fit.slope * x + fit.intercept) });
      const from = at(fit.from);
      const to = at(fit.to);
      return [{ key: this.keys()[seriesIndex], series: seriesIndex, color: seriesColor(this.list()[seriesIndex].color, seriesIndex), x1: from.x, y1: from.y, x2: to.x, y2: to.y }];
    });
  });

  readonly activeDot = computed(() => {
    const active = this.active();
    if (!active) return null;
    return this.dots().find((dot) => dot.series === active.series && dot.index === active.index) ?? null;
  });

  readonly guides = computed(() => {
    const dot = this.activeDot();
    if (!dot) return null;
    const plot = this.layout().plot;
    const bottom = this.xAxisPosition() === 'bottom';
    const left = this.yAxisPosition() === 'left';
    return {
      x: { x1: dot.cx, y1: bottom ? dot.cy + dot.r : plot.top, x2: dot.cx, y2: bottom ? plot.top + plot.height : dot.cy - dot.r },
      y: { x1: left ? plot.left : dot.cx + dot.r, y1: dot.cy, x2: left ? dot.cx - dot.r : plot.left + plot.width, y2: dot.cy },
    };
  });

  readonly labels = computed(() => {
    const t = this.translations();
    return { x: this.xAxisTitle() || 'x', y: this.yAxisTitle() || 'y', size: this.sizeLabel() || t.chartSize };
  });

  readonly legendItems = computed<TxChartLegendItem[]>(() => {
    const stat = this.legendVariant() === 'stat';
    const active = this.active();
    const format = this.formatY();
    return this.list().map((item, index) => {
      const point = active?.series === index ? this.data()[index][active.index] : null;
      return {
        key: this.keys()[index],
        label: item.name,
        color: seriesColor(item.color, index),
        hidden: this.hidden().has(this.keys()[index]),
        ...(stat
          ? point
            ? { value: format(point.y), caption: point.label ?? this.formatX()(point.x) }
            : { value: this.integer()(this.data()[index].length), caption: this.translations().chartTotal }
          : {}),
      };
    });
  });

  private readonly integer = computed(() => chartNumberFormatter(this.intl(), 'integer'));

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const active = this.active();
    const dot = this.activeDot();
    if (!active || !dot || !this.showTooltip() || this.legendVariant() === 'stat') return null;
    const point = this.data()[active.series][active.index];
    const labels = this.labels();
    const rows = [
      { label: this.list()[active.series].name, value: '', color: dot.color, raw: null, seriesIndex: active.series },
      { label: labels.x, value: this.formatX()(point.x), color: 'transparent', raw: point.x, seriesIndex: active.series },
      { label: labels.y, value: this.formatY()(point.y), color: 'transparent', raw: point.y, seriesIndex: active.series },
      ...(point.size !== null ? [{ label: labels.size, value: this.formatSize()(point.size), color: 'transparent', raw: point.size, seriesIndex: active.series }] : []),
    ];
    return { title: point.label ?? '', rows, index: active.index, x: dot.cx, y: dot.cy - dot.r, placement: 'top' };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const points = this.data().flat();
    const range = extent(points.map((point) => point.y));
    const format = this.formatY();
    const text = chartSummary(t, this.intl(), this.isBubble() ? t.chartBubble : t.chartScatter, this.list().length, points.length, range ? [format(range[0]), format(range[1])] : null);
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed<TxChartTable>(() => {
    const labels = this.labels();
    const bubble = this.isBubble();
    const rows = this.data().flatMap((points, seriesIndex) =>
      points.map((point) => ({
        label: point.label ? `${this.list()[seriesIndex].name}, ${point.label}` : this.list()[seriesIndex].name,
        cells: [this.formatX()(point.x), this.formatY()(point.y), ...(bubble ? [point.size === null ? '—' : this.formatSize()(point.size)] : [])],
      })),
    );
    return {
      columns: [
        { key: 'x', label: labels.x },
        { key: 'y', label: labels.y },
        ...(bubble ? [{ key: 'size', label: labels.size }] : []),
      ],
      rows: rows.slice(0, TX_CHART_TABLE_ROWS),
    };
  });

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
    afterRenderEffect(() => {
      this.dt();
      this.readRadius();
    });
  }

  private bubblePad(range: TxRange, length: number): number {
    if (!this.isBubble()) return 0;
    const span = range[1] - range[0] || Math.abs(range[0]) || 1;
    const usable = Math.max(1, length * BUBBLE_PLOT_SHARE - this.radius().max * 2);
    return (span * this.radius().max) / usable;
  }

  isActive(dot: TxScatterChartDot): boolean {
    const active = this.active();
    return !!active && active.series === dot.series && active.index === dot.index;
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.active.set(null);
      return;
    }
    const dot = nearestDot(this.dots(), event.x, event.y, HIT_SLACK);
    if (!dot) {
      this.active.set(null);
      return;
    }
    this.active.set({ index: dot.index, series: dot.series, pointerY: event.y, keyboard: false });
    if (event.type === 'click') {
      this.pointClick.emit(this.pointEvent(this.data()[dot.series][dot.index]));
    }
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.active.set(null);
      return;
    }
    const visible = this.visibleIndexes().filter((index) => this.data()[index].length);
    const current = this.active();
    let series = current && visible.includes(current.series) ? current.series : (visible[0] ?? -1);
    if (series < 0) return;
    let position = current?.series === series ? this.order()[series].indexOf(current.index) : -1;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const x = position >= 0 ? this.data()[series][this.order()[series][position]].x : null;
      series = cycleIndex(series, event.key === 'ArrowDown' ? 1 : -1, visible);
      position = x === null ? 0 : this.closestPosition(series, x);
    } else {
      position = stepIndex(event.key, position, this.order()[series].length);
    }
    if (position < 0) return;
    const index = this.order()[series][position];
    this.active.set({ index, series, pointerY: null, keyboard: true });
    const point = this.data()[series][index];
    const size = point.size === null ? '' : `, ${this.labels().size} ${this.formatSize()(point.size)}`;
    this.frame()?.announce(
      formatMessage(this.translations().chartPoint, {
        series: this.list()[series].name,
        category: point.label ?? `${this.labels().x} ${this.formatX()(point.x)}`,
        value: `${this.labels().y} ${this.formatY()(point.y)}${size}`,
      }),
    );
  }

  onLegendToggle(key: string): void {
    const index = this.keys().indexOf(key);
    this.hidden.update((keys) => toggleKey(keys, key));
    if (this.active()?.series === index) this.active.set(null);
    this.seriesToggle.emit({ seriesIndex: index, name: this.list()[index]?.name ?? '', hidden: this.hidden().has(key) });
  }

  onLegendHover(key: string | null): void {
    const index = key === null ? -1 : this.keys().indexOf(key);
    this.focusedSeries.set(index >= 0 && !this.hidden().has(key ?? '') ? index : null);
  }

  private closestPosition(series: number, x: number): number {
    const order = this.order()[series];
    let best = 0;
    let distance = Infinity;
    order.forEach((index, position) => {
      const next = Math.abs(this.data()[series][index].x - x);
      if (next < distance) {
        distance = next;
        best = position;
      }
    });
    return best;
  }

  private pointEvent(point: TxScatterDatum): TxScatterChartPointEvent {
    return { seriesIndex: point.series, dataPointIndex: point.index, x: point.x, y: point.y, size: point.size, label: point.label };
  }

  private readRadius(): void {
    const element = this.host.nativeElement;
    const next = {
      point: readTokenNumber(element, '--tx-chart-scatter-point-radius', DEFAULT_RADIUS.point),
      min: readTokenNumber(element, '--tx-chart-scatter-bubble-min-radius', DEFAULT_RADIUS.min),
      max: readTokenNumber(element, '--tx-chart-scatter-bubble-max-radius', DEFAULT_RADIUS.max),
    };
    const current = this.radius();
    if (current.point !== next.point || current.min !== next.min || current.max !== next.max) {
      this.radius.set(next);
    }
  }
}

function padRange([from, to]: TxRange, pad: number): TxRange {
  return [from >= 0 ? Math.max(0, from - pad) : from - pad, to <= 0 ? Math.min(0, to + pad) : to + pad];
}
