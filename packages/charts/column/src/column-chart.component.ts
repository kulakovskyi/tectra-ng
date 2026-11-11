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
  TxValueScaleKind,
  cartesianLayout,
  chartNumberFormatter,
  chartSummary,
  chartTable,
  cycleIndex,
  extent,
  hasChartData,
  initialChartSize,
  injectChartEntrance,
  normalizeSeries,
  readTokenNumber,
  seriesColor,
  stackExtent,
  stackValues,
  stepIndex,
  toggleKey,
} from '@tectra-ng/charts/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, formatMessage, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { columnBars } from './column-layout';
import { TxColumnChartPart, TxColumnChartPointEvent, TxColumnChartSeriesToggle, TxColumnChartStackType } from './column-chart.types';

const DEFAULT_WIDTH = 0.56;
const DEFAULT_HORIZONTAL_WIDTH = 0.64;
const DEFAULT_GROUP_GAP = 3;
const LABEL_FONT_SIZE = 11;
const HIT_SLACK = 4;
const MIN_HIT = 16;

@Component({
  selector: 'tx-column-chart',
  imports: [TxChartFrame, TxChartAxes],
  templateUrl: './column-chart.component.html',
  styleUrl: './column-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-column-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-orientation]': 'horizontal() ? "horizontal" : "vertical"',
    '[class.tx-column-chart--fill]': 'typeof height() === "string"',
    '[class.tx-column-chart--entering]': 'entrance.active()',
    '[class.tx-column-chart--morph]': 'morph()',
    '[class.tx-column-chart--focused]': 'focusedSeries() !== null',
    '[class.tx-column-chart--stacked]': 'isStacked()',
    '[class.tx-column-chart--active]': 'active() !== null',
  },
})
export class TxColumnChart {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly series = input<readonly TxChartSeries[] | null | undefined>([]);
  readonly categories = input<readonly (string | number | Date)[] | null | undefined>([]);
  readonly stacked = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly stackType = input<TxColumnChartStackType>('normal');
  readonly height = input<TxChartHeight>(350);
  readonly horizontal = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dataLabels = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showLegend = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly legendPosition = input<TxChartLegendPosition>('top');
  readonly legendAlign = input<TxChartLegendAlign>('start');
  readonly legendVariant = input<TxChartLegendVariant>('dot');
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly tooltipMode = input<TxChartTooltipMode>('shared');
  readonly tooltipFormatter = input<TxChartTooltipFormatter | null>(null);
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly yScale = input<TxValueScaleKind>('linear');
  readonly yMin = input<number | undefined>(undefined);
  readonly yMax = input<number | undefined>(undefined);
  readonly xAxisTitle = input('');
  readonly yAxisTitle = input('');
  readonly grid = input<TxChartGridMode | undefined>(undefined);
  readonly xAxisPosition = input<TxChartXAxisPosition>('bottom');
  readonly yAxisPosition = input<TxChartYAxisPosition>('left');
  readonly labelMode = input<TxChartLabelMode>('auto');
  readonly maxLabelWidth = input(220);
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxColumnChartPart, TxColumnChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly seriesToggle = output<TxColumnChartSeriesToggle>();
  readonly barClick = output<TxColumnChartPointEvent>();

  readonly legendTemplate = contentChild(TxChartLegendTemplate);
  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('columnChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);

  readonly hidden = signal<ReadonlySet<string>>(new Set());
  readonly focusedSeries = signal<number | null>(null);
  readonly active = signal<TxChartActive | null>(null);
  readonly geometry = signal({ width: DEFAULT_WIDTH, horizontalWidth: DEFAULT_HORIZONTAL_WIDTH, gap: DEFAULT_GROUP_GAP });

  private readonly intl = computed(() => this.locale.locale().intl);
  private readonly list = computed(() => this.series() ?? []);

  readonly table = computed(() => normalizeSeries(this.list(), this.categories() ?? [], 'category'));
  readonly keys = computed(() => this.list().map((item, index) => `${index}:${item.name}`));
  readonly visibleIndexes = computed(() => this.keys().flatMap((key, index) => (this.hidden().has(key) ? [] : [index])));
  readonly isEmpty = computed(() => !this.list().length || !hasChartData(this.table().values));
  readonly isStacked = computed(() => this.stacked() || this.stackType() === '100%');
  readonly legendShown = computed(() => this.showLegend() && this.list().length > 1);
  readonly size = linkedSignal(() => initialChartSize(this.height(), this.legendShown() ? this.legendPosition() : null, undefined, this.toolbar()));

  readonly stackedValues = computed(() => {
    const visible = new Set(this.visibleIndexes());
    return stackValues(
      this.table().values.map((row, index) => (visible.has(index) ? row : row.map(() => null))),
      this.stackType(),
    );
  });

  readonly valueExtent = computed<[number, number]>(() => {
    if (this.isStacked()) {
      return stackExtent(this.stackedValues());
    }
    return extent(this.visibleIndexes().flatMap((index) => this.table().values[index])) ?? [0, 1];
  });

  readonly percentStack = computed(() => this.isStacked() && this.stackType() === '100%');
  readonly axisFormat = computed<TxChartValueFormat>(() => (this.percentStack() && this.valueFormat() === 'number' ? 'percent' : this.valueFormat()));

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const horizontal = this.horizontal();
    return cartesianLayout({
      width,
      height,
      intl: this.intl(),
      horizontal,
      category: {
        kind: 'band',
        labels: this.table().labels,
        count: this.table().labels.length,
        labelMode: this.labelMode(),
        maxLabelWidth: this.maxLabelWidth(),
        title: this.xAxisTitle() || undefined,
      },
      value: {
        extent: this.valueExtent(),
        scale: this.yScale(),
        format: this.axisFormat(),
        includeZero: true,
        min: this.percentStack() ? 0 : this.yMin(),
        max: this.percentStack() ? 100 : this.yMax(),
        title: this.yAxisTitle() || undefined,
      },
      grid: this.grid() ?? 'value',
      xAxisPosition: this.xAxisPosition(),
      yAxisPosition: this.yAxisPosition(),
    });
  });

  readonly band = computed(() => this.layout().category as TxBandScale);

  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));

  readonly formatValue = computed(() => {
    const custom = this.tooltipFormatter();
    const format = this.valueFormatter();
    return (value: number, seriesIndex: number, dataPointIndex: number) => (custom ? custom(value, { seriesIndex, dataPointIndex }) : format(value));
  });

  readonly bars = computed(() => {
    const layout = this.layout();
    const geometry = this.geometry();
    const format = this.formatValue();
    const percent = this.percentStack();
    const stacked = this.stackedValues();
    return columnBars({
      band: this.band(),
      value: layout.value,
      horizontal: this.horizontal(),
      stacked: this.isStacked(),
      widthRatio: this.horizontal() ? geometry.horizontalWidth : geometry.width,
      groupGap: geometry.gap,
      values: this.table().values,
      stackedValues: stacked,
      visible: this.visibleIndexes(),
      colors: this.list().map((item) => item.color),
      labels: this.dataLabels()
        ? (value, series, index) => {
            if (percent) {
              const entry = stacked[series]?.[index];
              return entry ? chartNumberFormatter(this.intl(), 'percent')(entry[1] - entry[0]) : '';
            }
            return format(value, series, index);
          }
        : null,
      labelFontSize: LABEL_FONT_SIZE,
    });
  });

  readonly columns = computed(() => {
    const boxes = new Map<number, { x1: number; y1: number; x2: number; y2: number; negative: boolean }>();
    for (const bar of this.bars()) {
      const box = boxes.get(bar.index);
      const negative = bar.end === 'bottom' || bar.end === 'left';
      if (!box) {
        boxes.set(bar.index, { x1: bar.x, y1: bar.y, x2: bar.x + bar.width, y2: bar.y + bar.height, negative });
      } else {
        box.x1 = Math.min(box.x1, bar.x);
        box.y1 = Math.min(box.y1, bar.y);
        box.x2 = Math.max(box.x2, bar.x + bar.width);
        box.y2 = Math.max(box.y2, bar.y + bar.height);
        box.negative = box.negative && negative;
      }
    }
    return boxes;
  });

  readonly legendItems = computed<TxChartLegendItem[]>(() => {
    const stat = this.legendVariant() === 'stat';
    const active = this.active();
    const format = this.valueFormatter();
    return this.list().map((item, index) => {
      const values = this.table().values[index] ?? [];
      const raw = active ? values[active.index] : values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
      return {
        key: this.keys()[index],
        label: item.name,
        color: seriesColor(item.color, index),
        hidden: this.hidden().has(this.keys()[index]),
        ...(stat
          ? { value: raw === null || raw === undefined ? '—' : format(raw), caption: active ? this.table().labels[active.index] : this.translations().chartTotal }
          : {}),
      };
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
    const box = this.columns().get(active.index);
    if (!box) return null;
    const single = this.tooltipMode() === 'single';
    const bar = single ? this.bars().find((item) => item.index === active.index && item.series === active.series) : null;
    const area = bar ? { x1: bar.x, y1: bar.y, x2: bar.x + bar.width, y2: bar.y + bar.height, negative: bar.end === 'bottom' || bar.end === 'left' } : box;
    const total = this.isStacked() && rows.length > 1 ? this.valueFormatter()(rows.reduce((sum, row) => sum + (row.raw ?? 0), 0)) : undefined;
    const title = this.table().labels[active.index] ?? '';
    if (this.horizontal()) {
      return area.negative
        ? { title, rows, total, index: active.index, x: area.x1, y: (area.y1 + area.y2) / 2, placement: 'left' }
        : { title, rows, total, index: active.index, x: area.x2, y: (area.y1 + area.y2) / 2, placement: 'right' };
    }
    return area.negative
      ? { title, rows, total, index: active.index, x: (area.x1 + area.x2) / 2, y: area.y2, placement: 'bottom' }
      : { title, rows, total, index: active.index, x: (area.x1 + area.x2) / 2, y: area.y1, placement: 'top' };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const values = this.table().values.flat().filter((value): value is number => value !== null);
    const range = extent(values);
    const format = this.valueFormatter();
    const text = chartSummary(t, this.intl(), this.horizontal() ? t.chartBar : t.chartColumn, this.list().length, this.table().labels.length, range ? [format(range[0]), format(range[1])] : null);
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
    const index = this.columnAt(event.x, event.y);
    if (index < 0) {
      this.active.set(null);
      return;
    }
    const series = this.seriesAt(index, event.x, event.y);
    this.active.set({ index, series, pointerY: null, keyboard: false });
    if (event.type === 'click' && series >= 0) {
      this.barClick.emit({ seriesIndex: series, dataPointIndex: index, value: this.table().values[series][index], category: this.table().labels[index] ?? '' });
    }
  }

  private columnAt(x: number, y: number): number {
    const slack = HIT_SLACK;
    for (const [index, box] of this.columns()) {
      const minSize = this.horizontal() ? box.x2 - box.x1 : box.y2 - box.y1;
      const grow = Math.max(0, MIN_HIT - minSize) / 2;
      const x1 = box.x1 - slack - (this.horizontal() ? grow : 0);
      const x2 = box.x2 + slack + (this.horizontal() ? grow : 0);
      const y1 = box.y1 - slack - (this.horizontal() ? 0 : grow);
      const y2 = box.y2 + slack + (this.horizontal() ? 0 : grow);
      if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
        return index;
      }
    }
    return -1;
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.active.set(null);
      return;
    }
    const count = this.table().labels.length;
    const current = this.active();
    const visible = this.visibleIndexes();
    const horizontal = this.horizontal();
    let index = current?.index ?? -1;
    let series = current?.series ?? visible[0] ?? -1;
    const seriesKeys = horizontal ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
    if (seriesKeys.includes(event.key)) {
      series = cycleIndex(series, event.key === seriesKeys[1] ? 1 : -1, visible);
      index = Math.max(0, index);
    } else {
      index = horizontal ? stepIndex(event.key, index, count, 'ArrowDown', 'ArrowUp') : stepIndex(event.key, index, count);
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
    const hit = this.bars().find((bar) => bar.index === index && x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height);
    if (hit) return hit.series;
    const candidates = this.bars().filter((bar) => bar.index === index);
    return candidates[candidates.length - 1]?.series ?? this.visibleIndexes()[0] ?? -1;
  }

  private readGeometry(): void {
    const element = this.host.nativeElement;
    const next = {
      width: readTokenNumber(element, '--tx-chart-bar-width', DEFAULT_WIDTH),
      horizontalWidth: readTokenNumber(element, '--tx-chart-bar-horizontal-width', DEFAULT_HORIZONTAL_WIDTH),
      gap: readTokenNumber(element, '--tx-chart-bar-group-gap', DEFAULT_GROUP_GAP),
    };
    const current = this.geometry();
    if (current.width !== next.width || current.horizontalWidth !== next.horizontalWidth || current.gap !== next.gap) {
      this.geometry.set(next);
    }
  }
}
