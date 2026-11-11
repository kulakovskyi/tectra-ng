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
  TxChartAxes,
  TxChartFrame,
  TxChartGridMode,
  TxChartHeight,
  TxChartLabelMode,
  TxChartLegendAlign,
  TxChartLegendItem,
  TxChartLegendPosition,
  TxChartPointerEvent,
  TxChartTooltipData,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  cartesianLayout,
  chartNumberFormatter,
  chartSummary,
  initialChartSize,
  injectChartEntrance,
  readTokenNumber,
  stepIndex,
} from '@tectra-ng/charts/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { waterfallExtent, waterfallSteps } from './waterfall-layout';
import { TxWaterfallBarEvent, TxWaterfallChartBar, TxWaterfallChartPart, TxWaterfallConnector, TxWaterfallItem, TxWaterfallKind } from './waterfall-chart.types';

const DEFAULT_WIDTH = 0.56;
const LABEL_GAP = 4;

@Component({
  selector: 'tx-waterfall-chart',
  imports: [TxChartFrame, TxChartAxes],
  templateUrl: './waterfall-chart.component.html',
  styleUrl: './waterfall-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-waterfall-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-waterfall-chart--fill]': 'typeof height() === "string"',
    '[class.tx-waterfall-chart--entering]': 'entrance.active()',
    '[class.tx-waterfall-chart--morph]': 'morph()',
    '[class.tx-waterfall-chart--active]': 'active() !== null',
  },
})
export class TxWaterfallChart {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly items = input<readonly TxWaterfallItem[] | null | undefined>([]);
  readonly height = input<TxChartHeight>(350);
  readonly dataLabels = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly connectors = input<boolean, unknown>(true, { transform: booleanAttribute });
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
  readonly maxLabelWidth = input(220);
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxWaterfallChartPart, TxWaterfallChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly barClick = output<TxWaterfallBarEvent>();

  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('waterfallChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);
  readonly active = signal<number | null>(null);
  readonly barWidth = signal(DEFAULT_WIDTH);

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly list = computed(() => this.items() ?? []);
  readonly steps = computed(() => waterfallSteps(this.list()));
  readonly isEmpty = computed(() => !this.list().length);
  readonly kinds = computed(() => new Set(this.steps().map((step) => step.kind)));
  readonly legendShown = computed(() => this.showLegend() && this.kinds().size > 1);
  readonly size = linkedSignal(() => initialChartSize(this.height(), this.legendShown() ? this.legendPosition() : null, undefined, this.toolbar()));

  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));
  readonly signed = computed(() => {
    const format = this.valueFormatter();
    return (value: number) => (value > 0 ? `+${format(value)}` : value < 0 ? `−${format(-value)}` : format(value));
  });

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const labels = this.steps().map((step) => step.label);
    return cartesianLayout({
      width,
      height,
      intl: this.intl(),
      category: {
        kind: 'band',
        labels,
        count: labels.length,
        labelMode: this.labelMode(),
        maxLabelWidth: this.maxLabelWidth(),
        title: this.xAxisTitle() || undefined,
      },
      value: {
        extent: waterfallExtent(this.steps()),
        format: this.valueFormat(),
        includeZero: true,
        min: this.yMin(),
        max: this.yMax(),
        title: this.yAxisTitle() || undefined,
      },
      grid: this.grid(),
    });
  });

  readonly bars = computed<TxWaterfallChartBar[]>(() => {
    const layout = this.layout();
    const band = layout.category as TxBandScale;
    const width = band.bandwidth * Math.min(1, Math.max(0.05, this.barWidth()));
    const scale = layout.value;
    return this.steps().map((step) => {
      const a = scale.map(step.from);
      const b = scale.map(step.to);
      const y = Math.min(a, b);
      const height = Math.max(1, Math.abs(b - a));
      const above = step.kind === 'total' ? step.to >= 0 : step.change >= 0;
      return {
        ...step,
        key: `${step.index}:${step.label}`,
        x: band.center(step.index) - width / 2,
        y,
        width,
        height,
        text: this.dataLabels() ? (step.kind === 'total' ? this.valueFormatter()(step.to) : this.signed()(step.change)) : null,
        textY: above ? y - LABEL_GAP : y + height + LABEL_GAP,
        above,
      };
    });
  });

  readonly connectorLines = computed<TxWaterfallConnector[]>(() => {
    if (!this.connectors()) return [];
    const bars = this.bars();
    const scale = this.layout().value;
    return bars.slice(0, -1).map((bar, index) => {
      const next = bars[index + 1];
      return { key: `${bar.key}>${next.key}`, x1: bar.x + bar.width, x2: next.x, y: scale.map(bar.to) };
    });
  });

  readonly legendItems = computed<TxChartLegendItem[]>(() => {
    const t = this.translations();
    const names: Record<TxWaterfallKind, string> = { up: t.chartIncrease, down: t.chartDecrease, total: t.chartTotal };
    return (['up', 'down', 'total'] as const)
      .filter((kind) => this.kinds().has(kind))
      .map((kind) => ({ key: kind, label: names[kind], color: `var(--tx-chart-waterfall-${kind}-color)` }));
  });

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const index = this.active();
    if (index === null || !this.showTooltip()) return null;
    const bar = this.bars()[index];
    if (!bar) return null;
    const t = this.translations();
    const color = bar.color ?? `var(--tx-chart-waterfall-${bar.kind}-color)`;
    const rows =
      bar.kind === 'total'
        ? [{ label: t.chartTotal, value: this.valueFormatter()(bar.to), color, raw: bar.to, seriesIndex: 0, active: true }]
        : [
            { label: t.chartChange, value: this.signed()(bar.change), color, raw: bar.change, seriesIndex: 0, active: true },
            { label: t.chartTotal, value: this.valueFormatter()(bar.to), color: 'transparent', raw: bar.to, seriesIndex: 1 },
          ];
    return { title: bar.label, rows, index, x: bar.x + bar.width / 2, y: bar.above ? bar.y : bar.y + bar.height, placement: bar.above ? 'top' : 'bottom' };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const steps = this.steps();
    const last = steps[steps.length - 1];
    const text = chartSummary(t, this.intl(), t.chartWaterfall, 1, steps.length, null);
    const withTotal = last ? `${text}, ${t.chartTotal.toLocaleLowerCase(this.intl())} ${this.valueFormatter()(last.to)}` : text;
    return this.ariaLabel() ? `${this.ariaLabel()}. ${withTotal}` : withTotal;
  });

  readonly dataTable = computed(() => {
    const t = this.translations();
    return {
      columns: [
        { key: 'change', label: t.chartChange },
        { key: 'total', label: t.chartTotal },
      ],
      rows: this.steps().map((step) => ({
        label: step.label,
        cells: [step.kind === 'total' ? '—' : this.signed()(step.change), this.valueFormatter()(step.to)],
      })),
    };
  });

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
    afterRenderEffect(() => {
      this.dt();
      const next = readTokenNumber(this.host.nativeElement, '--tx-chart-bar-width', DEFAULT_WIDTH);
      if (next !== this.barWidth()) this.barWidth.set(next);
    });
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.active.set(null);
      return;
    }
    const plot = this.layout().plot;
    const band = this.layout().category as TxBandScale;
    const inside = event.x >= plot.left && event.x <= plot.left + plot.width && event.y >= plot.top - 8 && event.y <= plot.top + plot.height + 8;
    const index = inside ? band.indexAt(event.x) : -1;
    this.active.set(index >= 0 ? index : null);
    if (event.type === 'click' && index >= 0) {
      const step = this.steps()[index];
      this.barClick.emit({ index, label: step.label, change: step.change, total: step.to, kind: step.kind });
    }
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.active.set(null);
      return;
    }
    const index = stepIndex(event.key, this.active() ?? -1, this.steps().length);
    if (index < 0) return;
    this.active.set(index);
    const step = this.steps()[index];
    const t = this.translations();
    this.frame()?.announce(
      step.kind === 'total'
        ? `${step.label}: ${t.chartTotal} ${this.valueFormatter()(step.to)}`
        : `${step.label}: ${this.signed()(step.change)}, ${t.chartTotal.toLocaleLowerCase(this.intl())} ${this.valueFormatter()(step.to)}`,
    );
  }
}
