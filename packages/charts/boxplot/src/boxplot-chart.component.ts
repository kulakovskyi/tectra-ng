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
  TxChartPointerEvent,
  TxChartTooltipData,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  cartesianLayout,
  chartNumberFormatter,
  chartSummary,
  cycleIndex,
  extent,
  initialChartSize,
  injectChartEntrance,
  readTokenNumber,
  seriesColor,
  stepIndex,
  toggleKey,
} from '@tectra-ng/charts/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { toBoxStats } from './boxplot-stats';
import { TxBoxShape, TxBoxStats, TxBoxplotChartPart, TxBoxplotEvent, TxBoxplotSeries, TxBoxplotSeriesToggle } from './boxplot-chart.types';

const DEFAULTS = { boxWidth: 0.5, groupGap: 6, whiskerWidth: 0.5 };
const EDGE_SLACK = 8;

@Component({
  selector: 'tx-boxplot-chart',
  imports: [TxChartFrame, TxChartAxes],
  templateUrl: './boxplot-chart.component.html',
  styleUrl: './boxplot-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-boxplot-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-boxplot-chart--fill]': 'typeof height() === "string"',
    '[class.tx-boxplot-chart--entering]': 'entrance.active()',
    '[class.tx-boxplot-chart--morph]': 'morph()',
    '[class.tx-boxplot-chart--active]': 'active() !== null',
    '[class.tx-boxplot-chart--focused]': 'focusedSeries() !== null',
  },
})
export class TxBoxplotChart {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly series = input<readonly TxBoxplotSeries[] | null | undefined>([]);
  readonly categories = input<readonly string[] | null | undefined>([]);
  readonly height = input<TxChartHeight>(350);
  readonly showOutliers = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showLegend = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly legendPosition = input<TxChartLegendPosition>('top');
  readonly legendAlign = input<TxChartLegendAlign>('start');
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly yMin = input<number | undefined>(undefined);
  readonly yMax = input<number | undefined>(undefined);
  readonly xAxisTitle = input('');
  readonly yAxisTitle = input('');
  readonly grid = input<TxChartGridMode>('value');
  readonly labelMode = input<TxChartLabelMode>('auto');
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxBoxplotChartPart, TxBoxplotChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly boxClick = output<TxBoxplotEvent>();
  readonly seriesToggle = output<TxBoxplotSeriesToggle>();

  readonly legendTemplate = contentChild(TxChartLegendTemplate);
  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('boxplotChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);
  readonly hidden = signal<ReadonlySet<string>>(new Set());
  readonly focusedSeries = signal<number | null>(null);
  readonly active = signal<TxChartActive | null>(null);
  readonly geometry = signal(DEFAULTS);

  private readonly intl = computed(() => this.locale.locale().intl);
  private readonly list = computed(() => this.series() ?? []);
  readonly stats = computed(() => this.list().map((item) => item.data.map((entry) => toBoxStats(entry))));
  readonly labels = computed(() => {
    const count = Math.max(0, ...this.list().map((item) => item.data.length));
    const categories = this.categories() ?? [];
    return Array.from({ length: count }, (_, index) => categories[index] ?? `${index + 1}`);
  });
  readonly keys = computed(() => this.list().map((item, index) => `${index}:${item.name}`));
  readonly visibleIndexes = computed(() => this.keys().flatMap((key, index) => (this.hidden().has(key) ? [] : [index])));
  readonly isEmpty = computed(() => !this.stats().some((row) => row.some((entry) => entry !== null)));
  readonly legendShown = computed(() => this.showLegend() && this.list().length > 1);
  readonly size = linkedSignal(() => initialChartSize(this.height(), this.legendShown() ? this.legendPosition() : null, undefined, this.toolbar()));

  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const values = this.visibleIndexes().flatMap((index) =>
      this.stats()[index].flatMap((entry) => (entry ? [entry.min, entry.max, ...(this.showOutliers() ? (entry.outliers ?? []) : [])] : [])),
    );
    return cartesianLayout({
      width,
      height,
      intl: this.intl(),
      category: { kind: 'band', labels: this.labels(), count: this.labels().length, labelMode: this.labelMode(), title: this.xAxisTitle() || undefined },
      value: { extent: extent(values) ?? [0, 1], format: this.valueFormat(), includeZero: false, min: this.yMin(), max: this.yMax(), title: this.yAxisTitle() || undefined },
      grid: this.grid(),
    });
  });

  readonly boxes = computed<TxBoxShape[]>(() => {
    const layout = this.layout();
    const band = layout.category as TxBandScale;
    const scale = layout.value;
    const { boxWidth, groupGap, whiskerWidth } = this.geometry();
    const visible = this.visibleIndexes();
    const group = band.bandwidth * Math.min(1, Math.max(0.05, boxWidth * Math.max(1, Math.min(visible.length, 2))));
    const slots = Math.max(1, visible.length);
    const slot = (group - groupGap * (slots - 1)) / slots;
    return visible.flatMap((seriesIndex, position) =>
      this.stats()[seriesIndex].flatMap((entry, index) => {
        if (!entry) return [];
        const x = band.center(index) - group / 2 + position * (slot + groupGap);
        return [
          {
            key: `${seriesIndex}:${index}`,
            series: seriesIndex,
            index,
            color: seriesColor(this.list()[seriesIndex].color, seriesIndex),
            x,
            width: Math.max(1, slot),
            center: x + slot / 2,
            q1: scale.map(entry.q1),
            q3: scale.map(entry.q3),
            median: scale.map(entry.median),
            min: scale.map(entry.min),
            max: scale.map(entry.max),
            capWidth: Math.max(1, slot * whiskerWidth),
            outliers: this.showOutliers() ? (entry.outliers ?? []).map((value, at) => ({ key: `${at}:${value}`, y: scale.map(value), value })) : [],
          },
        ];
      }),
    );
  });

  readonly legendItems = computed<TxChartLegendItem[]>(() =>
    this.list().map((item, index) => ({ key: this.keys()[index], label: item.name, color: seriesColor(item.color, index), hidden: this.hidden().has(this.keys()[index]) })),
  );

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const active = this.active();
    if (!active || !this.showTooltip()) return null;
    const entry = this.stats()[active.series]?.[active.index];
    const box = this.boxes().find((item) => item.series === active.series && item.index === active.index);
    if (!entry || !box) return null;
    const t = this.translations();
    const format = this.valueFormatter();
    const row = (label: string, value: number, seriesIndex: number) => ({ label, value: format(value), color: 'transparent', raw: value, seriesIndex });
    const outliers = entry.outliers?.length ?? 0;
    const rows = [
      { label: this.list()[active.series].name, value: '', color: box.color, raw: null, seriesIndex: 0, active: true },
      row(t.chartMax, entry.max, 1),
      row(t.chartQ3, entry.q3, 2),
      row(t.chartMedian, entry.median, 3),
      row(t.chartQ1, entry.q1, 4),
      row(t.chartMin, entry.min, 5),
      ...(outliers ? [{ label: t.chartOutliers, value: chartNumberFormatter(this.intl(), 'integer')(outliers), color: 'transparent', raw: outliers, seriesIndex: 6 }] : []),
    ];
    const top = Math.min(box.max, ...box.outliers.map((item) => item.y));
    return { title: this.labels()[active.index] ?? '', rows, index: active.index, x: box.center, y: top, placement: 'top' };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const text = chartSummary(t, this.intl(), t.chartBoxplot, this.list().length, this.labels().length, null);
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() => {
    const t = this.translations();
    const format = this.valueFormatter();
    return {
      columns: [
        { key: 'min', label: t.chartMin },
        { key: 'q1', label: t.chartQ1 },
        { key: 'median', label: t.chartMedian },
        { key: 'q3', label: t.chartQ3 },
        { key: 'max', label: t.chartMax },
      ],
      rows: this.list().flatMap((item, seriesIndex) =>
        this.stats()[seriesIndex].flatMap((entry, index) =>
          entry
            ? [{ label: this.list().length > 1 ? `${item.name}, ${this.labels()[index]}` : this.labels()[index], cells: [entry.min, entry.q1, entry.median, entry.q3, entry.max].map((value) => format(value)) }]
            : [],
        ),
      ),
    };
  });

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
    afterRenderEffect(() => {
      this.dt();
      this.readGeometry();
    });
  }

  isActive(box: TxBoxShape): boolean {
    const active = this.active();
    return !!active && active.series === box.series && active.index === box.index;
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.active.set(null);
      return;
    }
    const plot = this.layout().plot;
    const inside =
      event.x >= plot.left && event.x <= plot.left + plot.width && event.y >= plot.top - EDGE_SLACK && event.y <= plot.top + plot.height + EDGE_SLACK;
    const index = inside ? (this.layout().category as TxBandScale).indexAt(event.x) : -1;
    const candidates = this.boxes().filter((box) => box.index === index);
    if (!candidates.length) {
      this.active.set(null);
      return;
    }
    const box = candidates.reduce((best, next) => (Math.abs(next.center - event.x) < Math.abs(best.center - event.x) ? next : best));
    this.active.set({ index, series: box.series, pointerY: event.y, keyboard: false });
    if (event.type === 'click') {
      const stats = this.stats()[box.series][index] as TxBoxStats;
      this.boxClick.emit({ seriesIndex: box.series, dataPointIndex: index, category: this.labels()[index] ?? '', stats });
    }
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
      index = stepIndex(event.key, index, this.labels().length);
    }
    if (index < 0 || series < 0) return;
    this.active.set({ index, series, pointerY: null, keyboard: true });
    const entry = this.stats()[series]?.[index];
    const t = this.translations();
    const format = this.valueFormatter();
    this.frame()?.announce(
      entry
        ? `${this.list()[series].name}, ${this.labels()[index]}: ${t.chartMedian} ${format(entry.median)}, ${t.chartQ1} ${format(entry.q1)}, ${t.chartQ3} ${format(entry.q3)}, ${t.chartMin} ${format(entry.min)}, ${t.chartMax} ${format(entry.max)}`
        : `${this.list()[series].name}, ${this.labels()[index]}: —`,
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

  private readGeometry(): void {
    const element = this.host.nativeElement;
    const next = {
      boxWidth: readTokenNumber(element, '--tx-chart-boxplot-box-width', DEFAULTS.boxWidth),
      groupGap: readTokenNumber(element, '--tx-chart-boxplot-group-gap', DEFAULTS.groupGap),
      whiskerWidth: readTokenNumber(element, '--tx-chart-boxplot-whisker-width', DEFAULTS.whiskerWidth),
    };
    const current = this.geometry();
    if (current.boxWidth !== next.boxWidth || current.groupGap !== next.groupGap || current.whiskerWidth !== next.whiskerWidth) {
      this.geometry.set(next);
    }
  }
}
