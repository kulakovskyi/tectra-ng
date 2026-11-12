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
import { candleExtent, candleLabels, isUp } from './candlestick-layout';
import { TxCandle, TxCandleEvent, TxCandleShape, TxCandlestickChartPart, TxCandlestickVariant } from './candlestick-chart.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { CANDLESTICK_ICON_DEFAULTS } from './candlestick.icons';

const DEFAULTS = { bodyWidth: 0.68, volumeHeight: 0.22 };
const EDGE_SLACK = 8;

@Component({
  selector: 'tx-candlestick-chart',
  imports: [TxChartFrame, TxChartAxes],
  templateUrl: './candlestick-chart.component.html',
  styleUrl: './candlestick-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-candlestick-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-variant]': 'variant()',
    '[class.tx-candlestick-chart--fill]': 'typeof height() === "string"',
    '[class.tx-candlestick-chart--entering]': 'entrance.active()',
    '[class.tx-candlestick-chart--morph]': 'morph()',
    '[class.tx-candlestick-chart--active]': 'active() !== null',
  },
  viewProviders: [provideTxIconDefaults(CANDLESTICK_ICON_DEFAULTS)],
})
export class TxCandlestickChart {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly data = input<readonly TxCandle[] | null | undefined>([]);
  readonly variant = input<TxCandlestickVariant>('candle');
  readonly showVolume = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly height = input<TxChartHeight>(380);
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly volumeFormat = input<TxChartValueFormat>('compact');
  readonly yMin = input<number | undefined>(undefined);
  readonly yMax = input<number | undefined>(undefined);
  readonly yAxisTitle = input('');
  readonly grid = input<TxChartGridMode>('value');
  readonly labelMode = input<TxChartLabelMode>('skip');
  readonly yAxisPosition = input<'left' | 'right'>('right');
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCandlestickChartPart, TxCandlestickChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly candleClick = output<TxCandleEvent>();

  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('candlestickChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);
  readonly active = signal<number | null>(null);
  readonly geometry = signal(DEFAULTS);

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly list = computed(() => (this.data() ?? []).filter((candle) => [candle.open, candle.high, candle.low, candle.close].every((value) => Number.isFinite(value))));
  readonly isEmpty = computed(() => !this.list().length);
  readonly hasVolume = computed(() => this.showVolume() && this.list().some((candle) => (candle.volume ?? 0) > 0));
  readonly size = linkedSignal(() => initialChartSize(this.height(), null, undefined, this.toolbar()));
  readonly labels = computed(() => candleLabels(this.list(), this.intl()));

  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));
  readonly volumeFormatter = computed(() => chartNumberFormatter(this.intl(), this.volumeFormat()));

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const labels = this.labels().axis;
    return cartesianLayout({
      width,
      height,
      intl: this.intl(),
      category: { kind: 'band', labels, count: labels.length, labelMode: this.labelMode() },
      value: {
        extent: candleExtent(this.list(), this.hasVolume() ? this.geometry().volumeHeight : 0),
        format: this.valueFormat(),
        includeZero: false,
        min: this.yMin(),
        max: this.yMax(),
        title: this.yAxisTitle() || undefined,
      },
      grid: this.grid(),
      yAxisPosition: this.yAxisPosition(),
    });
  });

  readonly candles = computed<TxCandleShape[]>(() => {
    const layout = this.layout();
    const band = layout.category as TxBandScale;
    const scale = layout.value;
    const width = Math.max(1, band.bandwidth * Math.min(1, Math.max(0.05, this.geometry().bodyWidth)));
    const plot = layout.plot;
    const volumeArea = this.hasVolume() ? plot.height * this.geometry().volumeHeight : 0;
    const maxVolume = Math.max(0, ...this.list().map((candle) => candle.volume ?? 0));
    return this.list().map((candle, index) => {
      const open = scale.map(candle.open);
      const close = scale.map(candle.close);
      const volume = candle.volume ?? 0;
      const volumeHeight = volumeArea && maxVolume ? (Math.max(0, volume) / maxVolume) * volumeArea : 0;
      return {
        index,
        key: `${index}`,
        up: isUp(candle),
        center: band.center(index),
        width,
        high: scale.map(candle.high),
        low: scale.map(candle.low),
        open,
        close,
        bodyY: Math.min(open, close),
        bodyHeight: Math.max(1, Math.abs(open - close)),
        volumeY: volumeHeight ? plot.top + plot.height - volumeHeight : null,
        volumeHeight,
      };
    });
  });

  readonly crosshair = computed(() => {
    const index = this.active();
    const candle = index === null ? null : this.candles()[index];
    if (!candle) return null;
    const plot = this.layout().plot;
    return { x: candle.center, y1: plot.top, y2: plot.top + plot.height };
  });

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const index = this.active();
    if (index === null || !this.showTooltip()) return null;
    const candle = this.list()[index];
    const shape = this.candles()[index];
    if (!candle || !shape) return null;
    const t = this.translations();
    const format = this.valueFormatter();
    const color = `var(--tx-chart-candlestick-${shape.up ? 'up' : 'down'}-color)`;
    const rows = [
      { label: t.chartOpen, value: format(candle.open), color, raw: candle.open, seriesIndex: 0 },
      { label: t.chartHigh, value: format(candle.high), color: 'transparent', raw: candle.high, seriesIndex: 1 },
      { label: t.chartLow, value: format(candle.low), color: 'transparent', raw: candle.low, seriesIndex: 2 },
      { label: t.chartClose, value: format(candle.close), color: 'transparent', raw: candle.close, seriesIndex: 3, active: true },
      ...(this.hasVolume() && candle.volume !== null && candle.volume !== undefined
        ? [{ label: t.chartVolume, value: this.volumeFormatter()(candle.volume), color: 'transparent', raw: candle.volume, seriesIndex: 4 }]
        : []),
    ];
    return { title: this.labels().full[index] ?? '', rows, index, x: shape.center, y: shape.high, placement: 'top' };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const list = this.list();
    const format = this.valueFormatter();
    const range = list.length ? [format(Math.min(...list.map((candle) => candle.low))), format(Math.max(...list.map((candle) => candle.high)))] as [string, string] : null;
    const text = chartSummary(t, this.intl(), t.chartCandlestick, 1, list.length, range);
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() => {
    const t = this.translations();
    const format = this.valueFormatter();
    const volume = this.hasVolume();
    return {
      columns: [
        { key: 'open', label: t.chartOpen },
        { key: 'high', label: t.chartHigh },
        { key: 'low', label: t.chartLow },
        { key: 'close', label: t.chartClose },
        ...(volume ? [{ key: 'volume', label: t.chartVolume }] : []),
      ],
      rows: this.list().map((candle, index) => ({
        label: this.labels().full[index],
        cells: [
          format(candle.open),
          format(candle.high),
          format(candle.low),
          format(candle.close),
          ...(volume ? [candle.volume === null || candle.volume === undefined ? '—' : this.volumeFormatter()(candle.volume)] : []),
        ],
      })),
    };
  });

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
    afterRenderEffect(() => {
      this.dt();
      this.readGeometry();
    });
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.active.set(null);
      return;
    }
    const plot = this.layout().plot;
    const inside =
      event.x >= plot.left - EDGE_SLACK && event.x <= plot.left + plot.width + EDGE_SLACK && event.y >= plot.top - EDGE_SLACK && event.y <= plot.top + plot.height + EDGE_SLACK;
    const index = inside ? (this.layout().category as TxBandScale).indexAt(event.x) : -1;
    this.active.set(index >= 0 ? index : null);
    if (event.type === 'click' && index >= 0) {
      this.candleClick.emit({ index, label: this.labels().full[index], candle: this.list()[index] });
    }
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.active.set(null);
      return;
    }
    const index = stepIndex(event.key, this.active() ?? -1, this.list().length);
    if (index < 0) return;
    this.active.set(index);
    const candle = this.list()[index];
    const t = this.translations();
    const format = this.valueFormatter();
    this.frame()?.announce(
      `${this.labels().full[index]}: ${t.chartOpen} ${format(candle.open)}, ${t.chartHigh} ${format(candle.high)}, ${t.chartLow} ${format(candle.low)}, ${t.chartClose} ${format(candle.close)}`,
    );
  }

  private readGeometry(): void {
    const element = this.host.nativeElement;
    const next = {
      bodyWidth: readTokenNumber(element, '--tx-chart-candlestick-body-width', DEFAULTS.bodyWidth),
      volumeHeight: readTokenNumber(element, '--tx-chart-candlestick-volume-height', DEFAULTS.volumeHeight),
    };
    const current = this.geometry();
    if (current.bodyWidth !== next.bodyWidth || current.volumeHeight !== next.volumeHeight) {
      this.geometry.set(next);
    }
  }
}
