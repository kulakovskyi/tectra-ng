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
  TxBandScale,
  TxChartActive,
  TxChartAxes,
  TxChartFrame,
  TxChartHoverBand,
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
  TxChartTooltipFormatter,
  TxChartTooltipMode,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  TxChartXAxisPosition,
  TxChartYAxisPosition,
  TxContinuousScale,
  TxStackedValue,
  TxValueScaleKind,
  areaPath,
  cartesianLayout,
  chartBandRect,
  chartNumberFormatter,
  chartSummary,
  chartTable,
  cycleIndex,
  extent,
  hasChartData,
  initialChartSize,
  injectChartEntrance,
  linePath,
  normalizeSeries,
  readTokenNumber,
  seriesColor,
  stackExtent,
  stackValues,
  stepIndex,
  toggleKey,
} from '@tectra-ng/charts/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, formatMessage, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { comboBars } from './combo-layout';
import {
  TxComboChartCurve,
  TxComboChartPart,
  TxComboChartPath,
  TxComboChartPointEvent,
  TxComboChartSeries,
  TxComboChartSeriesToggle,
  TxComboChartSeriesType,
} from './combo-chart.types';

const DEFAULT_WIDTH = 0.56;
const DEFAULT_GROUP_GAP = 3;
const EDGE_SLACK = 8;

@Component({
  selector: 'tx-combo-chart',
  imports: [TxChartFrame, TxChartAxes, TxChartHoverBand],
  templateUrl: './combo-chart.component.html',
  styleUrl: './combo-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-combo-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-combo-chart--fill]': 'typeof height() === "string"',
    '[class.tx-combo-chart--entering]': 'entrance.active()',
    '[class.tx-combo-chart--morph]': 'morph()',
    '[class.tx-combo-chart--focused]': 'focusedSeries() !== null',
    '[class.tx-combo-chart--stacked]': 'stacked()',
    '[class.tx-combo-chart--active]': 'active() !== null',
  },
})
export class TxComboChart {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly series = input<readonly TxComboChartSeries[] | null | undefined>([]);
  readonly categories = input<readonly (string | number | Date)[] | null | undefined>([]);
  readonly height = input<TxChartHeight>(350);
  readonly stacked = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly curve = input<TxComboChartCurve>('smooth');
  readonly markers = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showLegend = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly legendPosition = input<TxChartLegendPosition>('top');
  readonly legendAlign = input<TxChartLegendAlign>('start');
  readonly legendVariant = input<TxChartLegendVariant>('dot');
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly tooltipMode = input<TxChartTooltipMode>('shared');
  readonly tooltipFormatter = input<TxChartTooltipFormatter | null>(null);
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly y2ValueFormat = input<TxChartValueFormat | undefined>(undefined);
  readonly yScale = input<TxValueScaleKind>('linear');
  readonly yMin = input<number | undefined>(undefined);
  readonly yMax = input<number | undefined>(undefined);
  readonly y2Min = input<number | undefined>(undefined);
  readonly y2Max = input<number | undefined>(undefined);
  readonly xAxisTitle = input('');
  readonly yAxisTitle = input('');
  readonly y2AxisTitle = input('');
  readonly grid = input<TxChartGridMode>('value');
  readonly xAxisPosition = input<TxChartXAxisPosition>('bottom');
  readonly yAxisPosition = input<TxChartYAxisPosition>('left');
  readonly labelMode = input<TxChartLabelMode>('auto');
  readonly maxLabelWidth = input(220);
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxComboChartPart, TxComboChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly seriesToggle = output<TxComboChartSeriesToggle>();
  readonly pointClick = output<TxComboChartPointEvent>();

  readonly legendTemplate = contentChild(TxChartLegendTemplate);
  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('comboChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);

  readonly uid = uniqueId('tx-combo-chart');
  readonly hidden = signal<ReadonlySet<string>>(new Set());
  readonly focusedSeries = signal<number | null>(null);
  readonly active = signal<TxChartActive | null>(null);
  readonly geometry = signal({ width: DEFAULT_WIDTH, gap: DEFAULT_GROUP_GAP });

  private readonly intl = computed(() => this.locale.locale().intl);
  private readonly list = computed(() => this.series() ?? []);

  readonly table = computed(() => normalizeSeries(this.list(), this.categories() ?? [], 'category'));
  readonly keys = computed(() => this.list().map((item, index) => `${index}:${item.name}`));
  readonly types = computed<TxComboChartSeriesType[]>(() => this.list().map((item) => item.type ?? 'column'));
  readonly axes = computed(() => this.list().map((item) => (item.axis === 'secondary' ? 1 : 0)));
  readonly hasSecondary = computed(() => this.axes().includes(1));
  readonly visibleIndexes = computed(() => this.keys().flatMap((key, index) => (this.hidden().has(key) ? [] : [index])));
  readonly columnIndexes = computed(() => this.visibleIndexes().filter((index) => this.types()[index] === 'column'));
  readonly lineIndexes = computed(() => this.visibleIndexes().filter((index) => this.types()[index] !== 'column'));
  readonly isEmpty = computed(() => !this.list().length || !hasChartData(this.table().values));
  readonly legendShown = computed(() => this.showLegend() && this.list().length > 1);
  readonly size = linkedSignal(() => initialChartSize(this.height(), this.legendShown() ? this.legendPosition() : null, undefined, this.toolbar()));

  readonly stackedValues = computed<TxStackedValue[][]>(() => {
    const values = this.table().values;
    if (!this.stacked()) return values.map((row) => row.map(() => null));
    const columns = new Set(this.columnIndexes());
    const result: TxStackedValue[][] = values.map((row) => row.map(() => null));
    for (const axis of [0, 1]) {
      const rows = values.map((row, index) => (columns.has(index) && this.axes()[index] === axis ? row : row.map(() => null)));
      stackValues(rows, 'normal').forEach((row, index) => {
        if (columns.has(index) && this.axes()[index] === axis) result[index] = row;
      });
    }
    return result;
  });

  private axisExtent(axis: number): [number, number] | null {
    const values: (number | null)[] = [];
    const columns = this.columnIndexes().filter((index) => this.axes()[index] === axis);
    const lines = this.lineIndexes().filter((index) => this.axes()[index] === axis);
    if (!columns.length && !lines.length) return null;
    if (this.stacked() && columns.length) {
      const [min, max] = stackExtent(columns.map((index) => this.stackedValues()[index]));
      values.push(min, max);
    } else {
      columns.forEach((index) => values.push(...this.table().values[index]));
    }
    lines.forEach((index) => values.push(...this.table().values[index]));
    return extent(values);
  }

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const secondary = this.hasSecondary();
    return cartesianLayout({
      width,
      height,
      intl: this.intl(),
      category: {
        kind: 'band',
        labels: this.table().labels,
        count: this.table().labels.length,
        labelMode: this.labelMode(),
        maxLabelWidth: this.maxLabelWidth(),
        title: this.xAxisTitle() || undefined,
      },
      value: {
        extent: this.axisExtent(0) ?? [0, 1],
        scale: this.yScale(),
        format: this.valueFormat(),
        includeZero: true,
        min: this.yMin(),
        max: this.yMax(),
        title: this.yAxisTitle() || undefined,
      },
      secondaryValue: secondary
        ? {
            extent: this.axisExtent(1) ?? [0, 1],
            format: this.y2Format(),
            includeZero: true,
            min: this.y2Min(),
            max: this.y2Max(),
            title: this.y2AxisTitle() || undefined,
          }
        : undefined,
      grid: this.grid(),
      xAxisPosition: this.xAxisPosition(),
      yAxisPosition: this.yAxisPosition(),
    });
  });

  readonly y2Format = computed(() => this.y2ValueFormat() ?? this.valueFormat());
  readonly band = computed(() => this.layout().category as TxBandScale);
  readonly scales = computed<TxContinuousScale[]>(() => {
    const layout = this.layout();
    return [layout.value, layout.secondaryValue ?? layout.value];
  });

  readonly formatters = computed(() => [chartNumberFormatter(this.intl(), this.valueFormat()), chartNumberFormatter(this.intl(), this.y2Format())]);

  readonly formatValue = computed(() => {
    const custom = this.tooltipFormatter();
    const formatters = this.formatters();
    const axes = this.axes();
    return (value: number, seriesIndex: number, dataPointIndex: number) =>
      custom ? custom(value, { seriesIndex, dataPointIndex }) : formatters[axes[seriesIndex] ?? 0](value);
  });

  readonly bars = computed(() => {
    const geometry = this.geometry();
    return comboBars({
      band: this.band(),
      scales: this.scales(),
      axes: this.axes(),
      stacked: this.stacked(),
      widthRatio: geometry.width,
      groupGap: geometry.gap,
      values: this.table().values,
      stackedValues: this.stackedValues(),
      columns: this.columnIndexes(),
      colors: this.list().map((item) => item.color),
    });
  });

  readonly paths = computed<TxComboChartPath[]>(() => {
    const band = this.band();
    const curve = this.curve();
    return this.lineIndexes().map((seriesIndex) => {
      const scale = this.scales()[this.axes()[seriesIndex]];
      const [d0, d1] = scale.domain;
      const base = scale.map(d0 <= 0 && d1 >= 0 ? 0 : d0);
      const points = this.table().values[seriesIndex].map((value, index) => (value === null ? null : { x: band.center(index), y: scale.map(value), index }));
      const color = seriesColor(this.list()[seriesIndex].color, seriesIndex);
      return {
        index: seriesIndex,
        key: this.keys()[seriesIndex],
        color,
        line: linePath(points, curve),
        area: this.types()[seriesIndex] === 'area' ? areaPath(points, points.map((point) => (point ? { x: point.x, y: base } : null)), curve) : '',
        points: this.markers() && points.length <= this.layout().plot.width / 6 ? points : [],
        gradient: `${this.uid}-fill-${seriesIndex}`,
      };
    });
  });

  readonly activePoints = computed(() => {
    const active = this.active();
    if (!active) return [];
    const x = this.band().center(active.index);
    return this.lineIndexes().flatMap((seriesIndex) => {
      const value = this.table().values[seriesIndex][active.index];
      if (value === null || (this.tooltipMode() === 'single' && seriesIndex !== active.series)) return [];
      return [{ x, y: this.scales()[this.axes()[seriesIndex]].map(value), color: seriesColor(this.list()[seriesIndex].color, seriesIndex), series: seriesIndex }];
    });
  });

  readonly hoverBand = computed(() => {
    const active = this.active();
    return active ? chartBandRect(this.band(), active.index, this.layout().plot) : null;
  });

  readonly legendItems = computed<TxChartLegendItem[]>(() => {
    const stat = this.legendVariant() === 'stat';
    const active = this.active();
    const format = this.formatValue();
    return this.list().map((item, index) => {
      const values = this.table().values[index] ?? [];
      const raw = active ? values[active.index] : this.types()[index] === 'column' ? values.reduce<number>((sum, value) => sum + (value ?? 0), 0) : lastValue(values);
      const at = active?.index ?? -1;
      return {
        key: this.keys()[index],
        label: item.name,
        color: seriesColor(item.color, index),
        hidden: this.hidden().has(this.keys()[index]),
        marker: this.types()[index] === 'column' ? 'dot' : 'line',
        ...(stat
          ? { value: raw === null || raw === undefined ? '—' : format(raw, index, at), caption: active ? this.table().labels[active.index] : this.translations().chartTotal }
          : {}),
      };
    });
  });

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const active = this.active();
    if (!active || !this.showTooltip() || this.isEmpty() || this.legendVariant() === 'stat') return null;
    const format = this.formatValue();
    const single = this.tooltipMode() === 'single';
    const rows = this.visibleIndexes()
      .filter((seriesIndex) => !single || seriesIndex === active.series)
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
    const tops = [
      ...this.bars()
        .filter((bar) => bar.index === active.index && (!single || bar.series === active.series))
        .map((bar) => bar.y),
      ...this.activePoints().map((point) => point.y),
    ];
    const y = tops.length ? Math.min(...tops) : this.layout().plot.top;
    return { title: this.table().labels[active.index] ?? '', rows, index: active.index, x: this.band().center(active.index), y, placement: 'top' };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const text = chartSummary(t, this.intl(), t.chartCombo, this.list().length, this.table().labels.length, null);
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() => {
    const formatters = this.formatters();
    const axes = this.axes();
    return chartTable(
      this.table().labels,
      this.list().map((item, index) => ({ name: item.name, values: this.table().values[index] })),
      (value, seriesIndex) => formatters[axes[seriesIndex] ?? 0](value),
    );
  });

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
    afterRenderEffect(() => {
      this.dt();
      this.readGeometry();
    });
  }

  isActive(index: number, series: number): boolean {
    const active = this.active();
    return !!active && active.index === index && (this.tooltipMode() === 'shared' || active.series === series);
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.active.set(null);
      return;
    }
    const plot = this.layout().plot;
    const outside =
      event.x < plot.left - EDGE_SLACK || event.x > plot.left + plot.width + EDGE_SLACK || event.y < plot.top - EDGE_SLACK || event.y > plot.top + plot.height + EDGE_SLACK;
    const index = outside ? -1 : this.band().indexAt(event.x);
    if (index < 0) {
      this.active.set(null);
      return;
    }
    const series = this.seriesAt(index, event.x, event.y);
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

  private seriesAt(index: number, x: number, y: number): number {
    let best = -1;
    let distance = Infinity;
    for (const point of this.lineIndexes()) {
      const value = this.table().values[point][index];
      if (value === null) continue;
      const next = Math.abs(this.scales()[this.axes()[point]].map(value) - y);
      if (next < distance) {
        distance = next;
        best = point;
      }
    }
    const hit = this.bars().find((bar) => bar.index === index && x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height);
    if (hit && distance > EDGE_SLACK) return hit.series;
    if (best >= 0) return best;
    const candidates = this.bars().filter((bar) => bar.index === index);
    return candidates[candidates.length - 1]?.series ?? this.visibleIndexes()[0] ?? -1;
  }

  private readGeometry(): void {
    const element = this.host.nativeElement;
    const next = {
      width: readTokenNumber(element, '--tx-chart-bar-width', DEFAULT_WIDTH),
      gap: readTokenNumber(element, '--tx-chart-bar-group-gap', DEFAULT_GROUP_GAP),
    };
    const current = this.geometry();
    if (current.width !== next.width || current.gap !== next.gap) {
      this.geometry.set(next);
    }
  }
}

function lastValue(values: readonly (number | null)[]): number | null {
  for (let index = values.length - 1; index >= 0; index--) {
    if (values[index] !== null) return values[index];
  }
  return null;
}
