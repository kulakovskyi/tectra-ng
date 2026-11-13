import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  afterRenderEffect,
  ElementRef,
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
  TX_CHART_LEGEND_ROW,
  TX_CHART_LEGEND_SIDE,
  TxChartFrame,
  TxChartHeight,
  TxChartLegendAlign,
  TxChartLegendItem,
  TxChartLegendPosition,
  TxChartLegendTemplate,
  TxChartLegendVariant,
  TxChartTooltipPlacement,
  TxChartPointerEvent,
  TxChartTooltipData,
  TxChartTooltipFormatter,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  chartHeightValue,
  chartNumberFormatter,
  chartSummary,
  injectChartEntrance,
  numberFormat,
  parseRatio,
  readTokenNumber,
  seriesColor,
  textWidth,
  toggleKey,
} from '@tectra-ng/charts/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxPieCenter } from './pie-center.directive';
import { TxPieCenterData, TxPieChartPart, TxPieData, TxPieSegmentEvent, TxPieSegmentToggle, TxPieTotalFormatter } from './pie-chart.types';
import { arcAt, pieArcs } from './pie-layout';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { PIE_ICON_DEFAULTS } from './pie.icons';
import { PIE_THEME } from './pie.theme';

const MIN_LABEL_ANGLE = (10 * Math.PI) / 180;
const LEGEND_ITEM_WIDTH = 34;
const DEFAULT_SEGMENT_RADIUS = 4;
const STAT_ITEM_WIDTH = 116;
const STAT_ROW = 66;
const LEGEND_LINE = 25;
const LEGEND_ROW_GAP = 3;
const LEGEND_GAP = 10.5;

@Component({
  selector: 'tx-pie-chart',
  imports: [TxChartFrame, NgTemplateOutlet],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-pie-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-pie-chart--donut]': 'inner() > 0',
    '[class.tx-pie-chart--entering]': 'entrance.active()',
    '[class.tx-pie-chart--morph]': 'morph()',
    '[class.tx-pie-chart--hovering]': 'hovered() !== null',
  },
  viewProviders: [provideTxIconDefaults(PIE_ICON_DEFAULTS)],
})
export class TxPieChart {
  private readonly pieTheme = injectTokens(PIE_THEME);

  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly pieData = input.required<TxPieData | null | undefined>();
  readonly chartWidth = input<number | string>(200);
  readonly chartHeight = input<TxChartHeight>(400);
  readonly showLegend = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly legendPosition = input<TxChartLegendPosition>('bottom');
  readonly legendAlign = input<TxChartLegendAlign>('center');
  readonly legendValues = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly legendVariant = input<TxChartLegendVariant>('dot');
  readonly showDataLabels = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly totalLabel = input('');
  readonly totalFormatter = input<TxPieTotalFormatter | null>(null);
  readonly tooltipFormatter = input<TxChartTooltipFormatter | null>(null);
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly donutSize = input<string | number>('65%');
  readonly segmentGap = input(2);
  readonly segmentRadius = input<number | undefined>(undefined);
  readonly startAngle = input(0);
  readonly endAngle = input(360);
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxPieChartPart, TxPieChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly segmentClick = output<TxPieSegmentEvent>();
  readonly segmentToggle = output<TxPieSegmentToggle>();

  readonly centerTemplate = contentChild(TxPieCenter);
  readonly legendTemplate = contentChild(TxChartLegendTemplate);
  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('pieChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({
    ...this.tokenStyle(),
    width: this.cssSize(this.chartWidth()),
    height: this.cssSize(this.chartHeight()),
    ...this.passThrough().root?.style,
  }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);

  readonly hidden = signal<ReadonlySet<string>>(new Set());
  readonly hovered = signal<number | null>(null);
  readonly tokenRadius = signal(DEFAULT_SEGMENT_RADIUS);
  readonly keyboard = signal(false);
  readonly fromLegend = signal(false);

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly values = computed(() => this.pieData()?.series ?? []);
  readonly labels = computed(() => this.values().map((_, index) => this.pieData()?.labels[index] ?? ''));
  readonly keys = computed(() => this.labels().map((label, index) => `${index}:${label}`));
  readonly colors = computed(() => this.values().map((_, index) => seriesColor(this.pieData()?.colors?.[index], index)));
  readonly total = computed(() => this.values().reduce((sum, value, index) => sum + (value > 0 && !this.hidden().has(this.keys()[index]) ? value : 0), 0));
  readonly isEmpty = computed(() => !this.values().length || this.values().every((value) => !(value > 0)));
  readonly legendShown = computed(() => this.showLegend() && this.values().length > 0);
  readonly sideLegend = computed(() => this.legendPosition() === 'left' || this.legendPosition() === 'right');

  readonly size = linkedSignal(() => {
    const width = typeof this.chartWidth() === 'number' ? (this.chartWidth() as number) : 200;
    return { width: this.legendShown() && this.sideLegend() ? Math.max(80, width - TX_CHART_LEGEND_SIDE) : width, height: width };
  });

  readonly plotHeight = computed(() => {
    const width = this.size().width;
    const height = this.chartHeight();
    if (typeof height === 'string' && !/px$/.test(height.trim())) {
      return Math.round(width);
    }
    const toolbarRow = this.toolbar() && !(this.legendShown() && this.legendPosition() === 'top') ? TX_CHART_LEGEND_ROW : 0;
    const available = chartHeightValue(height) - (this.legendShown() && !this.sideLegend() ? this.legendReserve() : 0) - toolbarRow;
    return Math.max(40, Math.round(Math.min(width, available)));
  });

  readonly legendReserve = computed(() => {
    const width = Math.max(1, this.size().width);
    const items = this.legendItems();
    if (this.legendVariant() === 'stat') {
      const perRow = Math.max(1, Math.floor(width / STAT_ITEM_WIDTH));
      return Math.ceil(items.length / perRow) * STAT_ROW + 7;
    }
    if (this.legendValues()) {
      return items.length * 22 + 8;
    }
    let rows = 1;
    let line = 0;
    for (const item of items) {
      const next = textWidth(item.label, 12.25) + LEGEND_ITEM_WIDTH + (this.legendVariant() === 'pill' ? 12 : 0);
      if (line && line + next > width) {
        rows += 1;
        line = 0;
      }
      line += next;
    }
    return rows * LEGEND_LINE + (rows - 1) * LEGEND_ROW_GAP + LEGEND_GAP;
  });

  readonly inner = computed(() => Math.min(0.95, Math.max(0, parseRatio(this.donutSize(), 0.65))));

  readonly geometry = computed(() =>
    pieArcs(
      this.values().map((value, index) => (this.hidden().has(this.keys()[index]) ? 0 : value)),
      { width: this.size().width, height: this.plotHeight(), startAngle: this.startAngle(), endAngle: this.endAngle(), donutSize: this.inner(), padding: Math.max(8, this.segmentGap() + 2), cornerRadius: this.segmentRadius() ?? this.tokenRadius() },
    ),
  );

  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));
  readonly percentFormatter = computed(() => {
    const format = chartNumberFormatter(this.intl(), 'percent');
    return (value: number) => format(value);
  });

  readonly dataLabelFormatter = computed(() => {
    const format = numberFormat(this.intl(), { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return (percent: number) => format.format(percent / 100);
  });

  readonly segments = computed(() => {
    const { arcs } = this.geometry();
    const labelFormat = this.dataLabelFormatter();
    return arcs
      .filter((arc) => arc.end > arc.start)
      .map((arc) => ({
        ...arc,
        key: this.keys()[arc.index],
        color: this.colors()[arc.index],
        ux: Math.round(Math.sin(arc.middle) * 1000) / 1000,
        uy: Math.round(-Math.cos(arc.middle) * 1000) / 1000,
        label: this.showDataLabels() && arc.end - arc.start >= MIN_LABEL_ANGLE ? labelFormat(arc.percent) : null,
      }));
  });

  readonly center = computed<TxPieCenterData | null>(() => {
    const index = this.hovered();
    const formatTotal = this.totalFormatter();
    const format = formatTotal ?? this.valueFormatter();
    if (index !== null && this.values()[index] !== undefined) {
      const raw = this.values()[index];
      return { label: this.labels()[index], value: format(raw), raw, total: this.total(), hovered: true, index, color: this.colors()[index] };
    }
    if (!this.totalLabel()) {
      return null;
    }
    return { label: this.totalLabel(), value: format(this.total()), raw: this.total(), total: this.total(), hovered: false, index: -1, color: null };
  });

  readonly centerBox = computed(() => {
    const { fit, inner } = this.geometry();
    const side = inner * Math.SQRT2 * 0.92;
    return { x: fit.cx - side / 2, y: fit.cy - side / 2, size: Math.max(0, side), cx: fit.cx, cy: fit.cy };
  });

  readonly centerFont = computed(() => {
    const inner = this.geometry().inner;
    return { name: Math.max(10, Math.min(12, inner * 0.17)), value: Math.max(13, Math.min(22, inner * 0.3)) };
  });

  readonly legendItems = computed<TxChartLegendItem[]>(() => {
    const total = this.total();
    const format = this.valueFormatter();
    const percent = this.percentFormatter();
    return this.values().map((value, index) => ({
      key: this.keys()[index],
      label: this.labels()[index],
      color: this.colors()[index],
      hidden: this.hidden().has(this.keys()[index]),
      ...(this.legendVariant() === 'stat'
        ? { value: format(value), caption: percent(total && !this.hidden().has(this.keys()[index]) ? Number(((Math.max(0, value) / total) * 100).toFixed(1)) : 0) }
        : this.legendValues()
          ? { value: format(value), percent: percent(total && !this.hidden().has(this.keys()[index]) ? Number(((Math.max(0, value) / total) * 100).toFixed(1)) : 0) }
          : {}),
    }));
  });

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const index = this.hovered();
    if (index === null || !this.showTooltip() || this.isEmpty() || this.fromLegend() || this.legendVariant() === 'stat') return null;
    const raw = this.values()[index];
    const custom = this.tooltipFormatter();
    const value = custom ? custom(raw, { seriesIndex: index, dataPointIndex: index }) : this.valueFormatter()(raw);
    const { arcs, fit } = this.geometry();
    const arc = arcs[index];
    const sin = Math.sin(arc.middle);
    const cos = Math.cos(arc.middle);
    const placement: TxChartTooltipPlacement = Math.abs(sin) >= Math.SQRT1_2 ? (sin > 0 ? 'right' : 'left') : cos > 0 ? 'top' : 'bottom';
    const reach = fit.radius + 4;
    const share = this.percentFormatter()(Number(arc.percent.toFixed(1)));
    return {
      title: this.pieData()?.title ?? '',
      rows: [{ label: this.labels()[index], value, share, color: this.colors()[index], raw, seriesIndex: index, active: true }],
      index,
      x: fit.cx + sin * reach,
      y: fit.cy - cos * reach,
      placement,
    };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const values = this.values();
    const format = this.valueFormatter();
    const total = values.reduce((sum, value) => sum + (value > 0 ? value : 0), 0);
    const text = chartSummary(t, this.intl(), this.inner() > 0 ? t.chartDonut : t.chartPie, 1, values.length, null);
    const withTotal = `${text}, ${t.chartTotal.toLocaleLowerCase(this.intl())} ${format(total)}`;
    return this.ariaLabel() ? `${this.ariaLabel()}. ${withTotal}` : withTotal;
  });

  readonly dataTable = computed(() => {
    const t = this.translations();
    const format = this.valueFormatter();
    const percent = this.percentFormatter();
    const total = this.values().reduce((sum, value) => sum + (value > 0 ? value : 0), 0);
    return {
      columns: [
        { key: 'value', label: t.chartValue },
        { key: 'share', label: t.chartShare },
      ],
      rows: this.values().map((value, index) => ({
        label: this.labels()[index],
        cells: [format(value), percent(total ? Number(((Math.max(0, value) / total) * 100).toFixed(1)) : 0)],
      })),
    };
  });

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
    afterRenderEffect(() => {
      this.dt();
      const next = this.isUnstyled() ? 0 : readTokenNumber(this.host.nativeElement, '--tx-chart-pie-segment-radius', DEFAULT_SEGMENT_RADIUS);
      if (next !== this.tokenRadius()) {
        this.tokenRadius.set(next);
      }
    });
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.hovered.set(null);
      return;
    }
    const { arcs, fit, inner } = this.geometry();
    const index = arcAt(arcs, fit, inner, event.x, event.y);
    this.keyboard.set(false);
    this.fromLegend.set(false);
    this.hovered.set(index >= 0 ? index : null);
    if (event.type === 'click' && index >= 0) {
      this.segmentClick.emit({ index, label: this.labels()[index], value: this.values()[index], percent: arcs[index].percent });
    }
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.hovered.set(null);
      return;
    }
    const visible = this.segments().map((segment) => segment.index);
    if (!visible.length) return;
    const current = this.hovered();
    const at = current === null ? -1 : visible.indexOf(current);
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const next =
      event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1 : at < 0 ? (forward ? 0 : visible.length - 1) : (at + (forward ? 1 : -1) + visible.length) % visible.length;
    const index = visible[next];
    this.keyboard.set(true);
    this.fromLegend.set(false);
    this.hovered.set(index);
    const arc = this.geometry().arcs[index];
    this.frame()?.announce(`${this.labels()[index]}: ${this.valueFormatter()(this.values()[index])}, ${this.percentFormatter()(Number(arc.percent.toFixed(1)))}`);
  }

  onLegendToggle(key: string): void {
    const index = this.keys().indexOf(key);
    this.hidden.update((keys) => toggleKey(keys, key));
    this.hovered.set(null);
    this.segmentToggle.emit({ index, label: this.labels()[index] ?? '', hidden: this.hidden().has(key) });
  }

  onLegendHover(key: string | null): void {
    const index = key === null ? -1 : this.keys().indexOf(key);
    this.fromLegend.set(index >= 0);
    this.hovered.set(index >= 0 && !this.hidden().has(key ?? '') ? index : null);
  }

  private cssSize(value: number | string): string {
    return typeof value === 'number' ? `${value}px` : value;
  }
}
