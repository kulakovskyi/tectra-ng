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
  TxChartActive,
  TxChartFrame,
  TxChartHeight,
  TxChartLegendAlign,
  TxChartLegendItem,
  TxChartLegendPosition,
  TxChartLegendTemplate,
  TxChartLegendVariant,
  TxChartPointerEvent,
  TxChartSeries,
  TxChartTooltipData,
  TxChartTooltipFormatter,
  TxChartTooltipPlacement,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  TxRange,
  chartNumberFormatter,
  chartSummary,
  chartTable,
  cycleIndex,
  extent,
  hasChartData,
  initialChartSize,
  injectChartEntrance,
  linearTicks,
  niceDomain,
  normalizeSeries,
  polar,
  readTokenNumber,
  seriesColor,
  stepIndex,
  tickFormatter,
  toggleKey,
} from '@tectra-ng/charts/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, formatMessage, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { radarAngle, radarAxes, radarAxisAt, radarFit, radarPoints, radarPolygonPath, radarRadius, radarShapePath } from './radar-layout';
import { TxRadarChartPart, TxRadarChartPointEvent, TxRadarChartSeriesToggle, TxRadarChartShape, TxRadarPolygon, TxRadarRing } from './radar-chart.types';

const DEFAULT_LABEL = { fontSize: 11.5, gap: 10 };
const TICK_GAP = 4;

@Component({
  selector: 'tx-radar-chart',
  imports: [TxChartFrame],
  templateUrl: './radar-chart.component.html',
  styleUrl: './radar-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-radar-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-shape]': 'shape()',
    '[class.tx-radar-chart--fill]': 'typeof height() === "string"',
    '[class.tx-radar-chart--entering]': 'entrance.active()',
    '[class.tx-radar-chart--morph]': 'morph()',
    '[class.tx-radar-chart--focused]': 'focusedSeries() !== null',
    '[class.tx-radar-chart--active]': 'active() !== null',
  },
})
export class TxRadarChart {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly series = input<readonly TxChartSeries[] | null | undefined>([]);
  readonly categories = input<readonly (string | number | Date)[] | null | undefined>([]);
  readonly height = input<TxChartHeight>(350);
  readonly shape = input<TxRadarChartShape>('polygon');
  readonly min = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined);
  readonly rings = input(4);
  readonly fill = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly markers = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showTicks = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showLegend = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly legendPosition = input<TxChartLegendPosition>('top');
  readonly legendAlign = input<TxChartLegendAlign>('start');
  readonly legendVariant = input<TxChartLegendVariant>('dot');
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly tooltipFormatter = input<TxChartTooltipFormatter | null>(null);
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxRadarChartPart, TxRadarChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly seriesToggle = output<TxRadarChartSeriesToggle>();
  readonly pointClick = output<TxRadarChartPointEvent>();

  readonly legendTemplate = contentChild(TxChartLegendTemplate);
  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('radarChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);

  readonly hidden = signal<ReadonlySet<string>>(new Set());
  readonly focusedSeries = signal<number | null>(null);
  readonly active = signal<TxChartActive | null>(null);
  readonly label = signal(DEFAULT_LABEL);

  private readonly intl = computed(() => this.locale.locale().intl);
  private readonly list = computed(() => this.series() ?? []);

  readonly table = computed(() => normalizeSeries(this.list(), this.categories() ?? [], 'category'));
  readonly keys = computed(() => this.list().map((item, index) => `${index}:${item.name}`));
  readonly visibleIndexes = computed(() => this.keys().flatMap((key, index) => (this.hidden().has(key) ? [] : [index])));
  readonly isEmpty = computed(() => !this.list().length || !this.table().labels.length || !hasChartData(this.table().values));
  readonly legendShown = computed(() => this.showLegend() && this.list().length > 1);
  readonly size = linkedSignal(() => initialChartSize(this.height(), this.legendShown() ? this.legendPosition() : null, undefined, this.toolbar()));

  readonly domain = computed<TxRange>(() => {
    const values = this.visibleIndexes().flatMap((index) => this.table().values[index]);
    const [low, high] = extent(values) ?? [0, 1];
    const nice = niceDomain(Math.min(0, low), Math.max(high, Math.min(0, low) + 1e-9), Math.max(1, this.rings()));
    return [this.min() ?? nice[0], this.max() ?? nice[1]];
  });

  readonly fit = computed(() => {
    const { width, height } = this.size();
    const { fontSize, gap } = this.label();
    return radarFit(width, height, this.table().labels, fontSize, gap);
  });

  readonly axes = computed(() => radarAxes(this.table().labels, this.fit(), this.label().gap));

  readonly ringShapes = computed<TxRadarRing[]>(() => {
    const domain = this.domain();
    const fit = this.fit();
    const count = this.table().labels.length;
    const ticks = linearTicks(domain[0], domain[1], Math.max(1, this.rings())).filter((tick) => tick > domain[0] && tick <= domain[1]);
    const format = tickFormatter(this.intl(), ticks, this.valueFormat());
    return ticks.map((tick) => {
      const radius = radarRadius(tick, domain, fit.radius);
      const at = polar(fit.cx, fit.cy, radius, 0);
      return { value: tick, radius, path: radarShapePath(fit, radius, count, this.shape()), label: format(tick), labelX: at.x + TICK_GAP, labelY: at.y };
    });
  });

  readonly polygons = computed<TxRadarPolygon[]>(() => {
    const domain = this.domain();
    const fit = this.fit();
    return this.visibleIndexes().map((seriesIndex) => {
      const points = radarPoints(this.table().values[seriesIndex], domain, fit);
      return {
        index: seriesIndex,
        key: this.keys()[seriesIndex],
        color: seriesColor(this.list()[seriesIndex].color, seriesIndex),
        path: radarPolygonPath(points, fit),
        points,
      };
    });
  });

  readonly activePoints = computed(() => {
    const active = this.active();
    if (!active) return [];
    return this.polygons().flatMap((polygon) => {
      const point = polygon.points[active.index];
      return point ? [{ ...point, series: polygon.index, color: polygon.color, current: polygon.index === active.series }] : [];
    });
  });

  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));

  readonly formatValue = computed(() => {
    const custom = this.tooltipFormatter();
    const format = this.valueFormatter();
    return (value: number, seriesIndex: number, dataPointIndex: number) => (custom ? custom(value, { seriesIndex, dataPointIndex }) : format(value));
  });

  readonly legendItems = computed<TxChartLegendItem[]>(() => {
    const stat = this.legendVariant() === 'stat';
    const active = this.active();
    const format = this.formatValue();
    return this.list().map((item, index) => {
      const values = this.table().values[index] ?? [];
      const known = values.filter((value): value is number => value !== null);
      const raw = active ? values[active.index] : known.length ? known.reduce((sum, value) => sum + value, 0) / known.length : null;
      return {
        key: this.keys()[index],
        label: item.name,
        color: seriesColor(item.color, index),
        hidden: this.hidden().has(this.keys()[index]),
        ...(stat
          ? { value: raw === null || raw === undefined ? '—' : format(raw, index, active?.index ?? -1), caption: active ? this.table().labels[active.index] : this.translations().chartAverage }
          : {}),
      };
    });
  });

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const active = this.active();
    if (!active || !this.showTooltip() || this.isEmpty() || this.legendVariant() === 'stat') return null;
    const format = this.formatValue();
    const rows = this.visibleIndexes().flatMap((seriesIndex) => {
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
    const fit = this.fit();
    const angle = radarAngle(active.index, this.table().labels.length);
    const reach = Math.max(...this.activePoints().map((point) => Math.hypot(point.x - fit.cx, point.y - fit.cy)), 0) + 6;
    const at = polar(fit.cx, fit.cy, reach, angle);
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const placement: TxChartTooltipPlacement = Math.abs(sin) >= Math.SQRT1_2 ? (sin > 0 ? 'right' : 'left') : cos > 0 ? 'top' : 'bottom';
    return { title: this.table().labels[active.index] ?? '', rows, index: active.index, x: at.x, y: at.y, placement };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const values = this.table().values.flat().filter((value): value is number => value !== null);
    const range = extent(values);
    const format = this.valueFormatter();
    const text = chartSummary(t, this.intl(), t.chartRadar, this.list().length, this.table().labels.length, range ? [format(range[0]), format(range[1])] : null);
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() =>
    chartTable(
      this.table().labels,
      this.list().map((item, index) => ({ name: item.name, values: this.table().values[index] })),
      this.valueFormatter(),
    ),
  );

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
    afterRenderEffect(() => {
      this.dt();
      this.readLabel();
    });
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.active.set(null);
      return;
    }
    const fit = this.fit();
    const index = radarAxisAt(event.x, event.y, fit, this.table().labels.length, this.label().gap + 4);
    if (index < 0) {
      this.active.set(null);
      return;
    }
    const series = this.nearestSeries(index, Math.hypot(event.x - fit.cx, event.y - fit.cy));
    this.active.set({ index, series, pointerY: event.y, keyboard: false });
    if (event.type === 'click' && series >= 0) {
      this.pointClick.emit({ seriesIndex: series, dataPointIndex: index, value: this.table().values[series][index], category: this.table().labels[index] ?? '' });
    }
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.active.set(null);
      return;
    }
    const count = this.table().labels.length;
    const current = this.active();
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
        category: this.table().labels[index] ?? '',
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

  private nearestSeries(index: number, distance: number): number {
    const fit = this.fit();
    const domain = this.domain();
    let best = this.visibleIndexes()[0] ?? -1;
    let gap = Infinity;
    for (const seriesIndex of this.visibleIndexes()) {
      const value = this.table().values[seriesIndex][index];
      if (value === null) continue;
      const next = Math.abs(radarRadius(value, domain, fit.radius) - distance);
      if (next < gap) {
        gap = next;
        best = seriesIndex;
      }
    }
    return best;
  }

  private readLabel(): void {
    const element = this.host.nativeElement;
    const next = {
      fontSize: readTokenNumber(element, '--tx-chart-radar-label-font-size', DEFAULT_LABEL.fontSize),
      gap: readTokenNumber(element, '--tx-chart-radar-label-gap', DEFAULT_LABEL.gap),
    };
    const current = this.label();
    if (current.fontSize !== next.fontSize || current.gap !== next.gap) {
      this.label.set(next);
    }
  }
}
