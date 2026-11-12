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
  TxChartFrame,
  TxChartHeight,
  TxChartPointerEvent,
  TxChartTooltipData,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  chartNumberFormatter,
  chartSummary,
  initialChartSize,
  injectChartEntrance,
  readTokenNumber,
  seriesColor,
  stepIndex,
  textWidth,
  truncateText,
} from '@tectra-ng/charts/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { funnelBoxes, funnelConnectorPath, funnelIndexAt, funnelRate } from './funnel-layout';
import { TxFunnelChartPart, TxFunnelConnector, TxFunnelItem, TxFunnelStage, TxFunnelStageEvent } from './funnel-chart.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { FUNNEL_ICON_DEFAULTS } from './funnel.icons';

const DEFAULTS = { gap: 0.32, labelWidth: 0.3, labelFontSize: 12.25, valueFontSize: 12, conversionFontSize: 11 };
const PADDING = 4;
const LABEL_PAD = 12;
const MIN_WIDTH = 4;

@Component({
  selector: 'tx-funnel-chart',
  imports: [TxChartFrame],
  templateUrl: './funnel-chart.component.html',
  styleUrl: './funnel-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-funnel-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-funnel-chart--fill]': 'typeof height() === "string"',
    '[class.tx-funnel-chart--entering]': 'entrance.active()',
    '[class.tx-funnel-chart--morph]': 'morph()',
    '[class.tx-funnel-chart--active]': 'active() !== null',
  },
  viewProviders: [provideTxIconDefaults(FUNNEL_ICON_DEFAULTS)],
})
export class TxFunnelChart {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly items = input<readonly TxFunnelItem[] | null | undefined>([]);
  readonly height = input<TxChartHeight>(320);
  readonly colorful = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showLabels = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showValues = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showConversion = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly connectors = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxFunnelChartPart, TxFunnelChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly stageClick = output<TxFunnelStageEvent>();

  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('funnelChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);
  readonly active = signal<number | null>(null);
  readonly geometry = signal(DEFAULTS);

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly list = computed(() => this.items() ?? []);
  readonly values = computed(() => this.list().map((item) => (item.value !== null && Number.isFinite(item.value) ? Math.max(0, item.value) : 0)));
  readonly isEmpty = computed(() => !this.values().some((value) => value > 0));
  readonly size = linkedSignal(() => initialChartSize(this.height(), null, undefined, this.toolbar()));

  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));
  readonly percentFormatter = computed(() => chartNumberFormatter(this.intl(), 'percent'));

  readonly labelColumn = computed(() => {
    if (!this.showLabels()) return 0;
    const { labelWidth, labelFontSize } = this.geometry();
    const widest = Math.max(0, ...this.list().map((item) => textWidth(item.label, labelFontSize)));
    return Math.min(this.size().width * labelWidth, widest + LABEL_PAD);
  });

  readonly stages = computed<TxFunnelStage[]>(() => {
    const { width, height } = this.size();
    const column = this.labelColumn();
    const values = this.values();
    const first = values[0] ?? 0;
    const boxes = funnelBoxes({ values, left: column, width: Math.max(1, width - column - PADDING), top: PADDING, height: Math.max(1, height - PADDING * 2), gapRatio: this.geometry().gap, minWidth: MIN_WIDTH });
    return boxes.map((box, index) => ({
      ...box,
      key: `${index}:${this.list()[index].label}`,
      label: this.list()[index].label,
      ofFirst: funnelRate(box.value, first),
      conversion: index ? funnelRate(box.value, values[index - 1]) : null,
      color: this.colorful() ? seriesColor(this.list()[index].color, index) : (this.list()[index].color ?? seriesColor(undefined, 0)),
    }));
  });

  readonly connectorShapes = computed<TxFunnelConnector[]>(() => {
    const stages = this.stages();
    return stages.slice(1).map((stage, index) => {
      const upper = stages[index];
      return {
        key: `${upper.key}>${stage.key}`,
        index: stage.index,
        path: funnelConnectorPath(upper, stage),
        color: upper.color,
        textX: upper.x + upper.width / 2,
        textY: (upper.y + upper.height + stage.y) / 2,
        conversion: stage.conversion ?? 0,
      };
    });
  });

  readonly gapHeight = computed(() => {
    const stages = this.stages();
    return stages.length > 1 ? stages[1].y - stages[0].y - stages[0].height : 0;
  });

  readonly labels = computed(() => {
    const column = this.labelColumn();
    const { labelFontSize, valueFontSize } = this.geometry();
    return this.stages().map((stage) => {
      const value = this.valueFormatter()(stage.value);
      const inside = stage.width >= textWidth(value, valueFontSize) + 12;
      return {
        key: stage.key,
        index: stage.index,
        label: truncateText(stage.label, Math.max(0, column - LABEL_PAD), labelFontSize),
        full: stage.label,
        labelX: 0,
        y: stage.y + stage.height / 2,
        value,
        valueX: inside ? stage.x + stage.width / 2 : stage.x + stage.width + 6,
        inside,
      };
    });
  });

  readonly formatPercent = computed(() => {
    const format = this.percentFormatter();
    return (value: number) => format(Number(value.toFixed(1)));
  });

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const index = this.active();
    if (index === null || !this.showTooltip()) return null;
    const stage = this.stages()[index];
    if (!stage) return null;
    const t = this.translations();
    const percent = this.formatPercent();
    const rows = [
      { label: stage.label, value: this.valueFormatter()(stage.value), color: stage.color, raw: stage.value, seriesIndex: 0, active: true },
      ...(index ? [{ label: t.chartOfFirst, value: percent(stage.ofFirst), color: 'transparent', raw: stage.ofFirst, seriesIndex: 1 }] : []),
      ...(stage.conversion !== null ? [{ label: t.chartConversion, value: percent(stage.conversion), color: 'transparent', raw: stage.conversion, seriesIndex: 2 }] : []),
    ];
    return { title: '', rows, index, x: stage.x + stage.width / 2, y: stage.y, placement: 'top' };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const stages = this.stages();
    const last = stages[stages.length - 1];
    const text = chartSummary(t, this.intl(), t.chartFunnel, 1, stages.length, null);
    const rate = last && stages.length > 1 ? `, ${t.chartConversion.toLocaleLowerCase(this.intl())} ${this.formatPercent()(last.ofFirst)}` : '';
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}${rate}` : `${text}${rate}`;
  });

  readonly dataTable = computed(() => {
    const t = this.translations();
    const percent = this.formatPercent();
    return {
      columns: [
        { key: 'value', label: t.chartValue },
        { key: 'first', label: t.chartOfFirst },
        { key: 'conversion', label: t.chartConversion },
      ],
      rows: this.stages().map((stage) => ({
        label: stage.label,
        cells: [this.valueFormatter()(stage.value), percent(stage.ofFirst), stage.conversion === null ? '—' : percent(stage.conversion)],
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
    const index = funnelIndexAt(this.stages(), event.y);
    this.active.set(index >= 0 ? index : null);
    if (event.type === 'click' && index >= 0) {
      const stage = this.stages()[index];
      this.stageClick.emit({ index, label: stage.label, value: stage.value, ofFirst: stage.ofFirst, conversion: stage.conversion });
    }
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.active.set(null);
      return;
    }
    const key = event.key === 'ArrowDown' ? 'ArrowRight' : event.key === 'ArrowUp' ? 'ArrowLeft' : event.key;
    const index = stepIndex(key, this.active() ?? -1, this.stages().length);
    if (index < 0) return;
    this.active.set(index);
    const stage = this.stages()[index];
    const t = this.translations();
    const conversion = stage.conversion === null ? '' : `, ${t.chartConversion.toLocaleLowerCase(this.intl())} ${this.formatPercent()(stage.conversion)}`;
    this.frame()?.announce(`${stage.label}: ${this.valueFormatter()(stage.value)}${conversion}`);
  }

  private readGeometry(): void {
    const element = this.host.nativeElement;
    const next = {
      gap: readTokenNumber(element, '--tx-chart-funnel-row-gap', DEFAULTS.gap),
      labelWidth: readTokenNumber(element, '--tx-chart-funnel-label-width', DEFAULTS.labelWidth),
      labelFontSize: readTokenNumber(element, '--tx-chart-funnel-label-font-size', DEFAULTS.labelFontSize),
      valueFontSize: readTokenNumber(element, '--tx-chart-funnel-value-font-size', DEFAULTS.valueFontSize),
      conversionFontSize: readTokenNumber(element, '--tx-chart-funnel-conversion-font-size', DEFAULTS.conversionFontSize),
    };
    const current = this.geometry();
    if ((Object.keys(next) as (keyof typeof next)[]).some((key) => next[key] !== current[key])) {
      this.geometry.set(next);
    }
  }
}
