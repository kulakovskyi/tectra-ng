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
  TxChartLegendAlign,
  TxChartLegendItem,
  TxChartLegendPosition,
  TxChartLegendTemplate,
  TxChartLegendVariant,
  TxChartPointerEvent,
  TxChartTooltipData,
  TxChartTooltipPlacement,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  angleFrom,
  arcSpan,
  chartNumberFormatter,
  fitArc,
  chartSummary,
  initialChartSize,
  injectChartEntrance,
  parseRatio,
  polar,
  readTokenNumber,
  seriesColor,
  strokeArc,
  toggleKey,
} from '@tectra-ng/charts/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { radialRings, radialShare } from './radial-bar-layout';
import { TxRadialBarCenter, TxRadialBarEvent, TxRadialBarItem, TxRadialBarPart, TxRadialBarRing, TxRadialBarToggle } from './radial-bar.types';

const DEFAULT_THICKNESS = 0.62;
const PADDING = 6;
const HIT_SLACK = 3;

@Component({
  selector: 'tx-radial-bar',
  imports: [TxChartFrame],
  templateUrl: './radial-bar.component.html',
  styleUrl: './radial-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-radial-bar',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-radial-bar--fill]': 'typeof height() === "string"',
    '[class.tx-radial-bar--entering]': 'entrance.active()',
    '[class.tx-radial-bar--morph]': 'morph()',
    '[class.tx-radial-bar--hovering]': 'hovered() !== null',
  },
})
export class TxRadialBar {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly items = input<readonly TxRadialBarItem[] | null | undefined>([]);
  readonly max = input(100);
  readonly height = input<TxChartHeight>(300);
  readonly startAngle = input(0);
  readonly endAngle = input(360);
  readonly hole = input<string | number>('35%');
  readonly track = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly centerValue = input<'percent' | 'value'>('percent');
  readonly totalLabel = input('');
  readonly showLegend = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly legendPosition = input<TxChartLegendPosition>('bottom');
  readonly legendAlign = input<TxChartLegendAlign>('center');
  readonly legendVariant = input<TxChartLegendVariant>('dot');
  readonly legendValues = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly toolbar = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxRadialBarPart, TxRadialBar> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly barClick = output<TxRadialBarEvent>();
  readonly barToggle = output<TxRadialBarToggle>();

  readonly legendTemplate = contentChild(TxChartLegendTemplate);
  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('radialBar', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);

  readonly hidden = signal<ReadonlySet<string>>(new Set());
  readonly hovered = signal<number | null>(null);
  readonly fromLegend = signal(false);
  readonly thickness = signal(DEFAULT_THICKNESS);

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly list = computed(() => this.items() ?? []);
  readonly keys = computed(() => this.list().map((item, index) => `${index}:${item.label}`));
  readonly visibleIndexes = computed(() => this.keys().flatMap((key, index) => (this.hidden().has(key) ? [] : [index])));
  readonly isEmpty = computed(() => !this.list().some((item) => item.value !== null && Number.isFinite(item.value)));
  readonly legendShown = computed(() => this.showLegend() && this.list().length > 1);
  readonly size = linkedSignal(() => initialChartSize(this.height(), this.legendShown() ? this.legendPosition() : null, undefined, this.toolbar()));

  readonly span = computed(() => arcSpan(this.startAngle(), this.endAngle()));
  readonly fit = computed(() => fitArc(this.size().width, this.size().height, this.startAngle(), this.endAngle(), PADDING));
  readonly inner = computed(() => this.fit().radius * Math.min(0.9, Math.max(0, parseRatio(this.hole(), 0.35))));

  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));
  readonly percentFormatter = computed(() => chartNumberFormatter(this.intl(), 'percent'));

  readonly rings = computed<TxRadialBarRing[]>(() => {
    const fit = this.fit();
    const [start, end] = this.span();
    const visible = this.visibleIndexes();
    const slots = radialRings(visible.length, fit.radius, this.inner(), this.thickness());
    return visible.map((index, slot) => {
      const item = this.list()[index];
      const max = item.max ?? this.max();
      const share = radialShare(item.value, max);
      const { radius, width } = slots[slot];
      const barEnd = start + (end - start) * share;
      return {
        index,
        key: this.keys()[index],
        label: item.label,
        value: item.value ?? 0,
        max,
        share,
        color: seriesColor(item.color, index),
        radius,
        width,
        track: strokeArc(fit.cx, fit.cy, radius, start, end),
        bar: share > 0 ? strokeArc(fit.cx, fit.cy, radius, start, Math.max(start + 1e-3, barEnd)) : '',
        start,
        end: barEnd,
      };
    });
  });

  readonly center = computed<TxRadialBarCenter | null>(() => {
    const index = this.hovered();
    const rings = this.rings();
    const ring = rings.find((item) => item.index === index) ?? (rings.length === 1 ? rings[0] : null);
    if (ring) {
      return { label: ring.label, value: this.centerText(ring), index: ring.index, color: ring.color };
    }
    if (!this.totalLabel() || !rings.length) return null;
    const average = rings.reduce((sum, item) => sum + item.share, 0) / rings.length;
    return { label: this.totalLabel(), value: this.percentFormatter()(Number((average * 100).toFixed(1))), index: -1, color: null };
  });

  readonly centerFont = computed(() => {
    const inner = Math.max(this.inner(), this.fit().radius * 0.25);
    return { value: Math.max(13, Math.min(28, inner * 0.42)), label: Math.max(10, Math.min(13, inner * 0.2)) };
  });

  readonly legendItems = computed<TxChartLegendItem[]>(() =>
    this.list().map((item, index) => {
      const share = radialShare(item.value, item.max ?? this.max());
      const value = item.value === null ? '—' : this.valueFormatter()(item.value);
      const percent = this.percentFormatter()(Number((share * 100).toFixed(1)));
      return {
        key: this.keys()[index],
        label: item.label,
        color: seriesColor(item.color, index),
        hidden: this.hidden().has(this.keys()[index]),
        ...(this.legendVariant() === 'stat' ? { value, caption: percent } : this.legendValues() ? { value, percent } : {}),
      };
    }),
  );

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const index = this.hovered();
    if (index === null || !this.showTooltip() || this.fromLegend() || this.legendVariant() === 'stat') return null;
    const ring = this.rings().find((item) => item.index === index);
    if (!ring) return null;
    const fit = this.fit();
    const at = polar(fit.cx, fit.cy, ring.radius + ring.width / 2 + 2, ring.end);
    const sin = Math.sin(ring.end);
    const cos = Math.cos(ring.end);
    const placement: TxChartTooltipPlacement = Math.abs(sin) >= Math.SQRT1_2 ? (sin > 0 ? 'right' : 'left') : cos > 0 ? 'top' : 'bottom';
    const item = this.list()[index];
    return {
      title: '',
      rows: [
        {
          label: ring.label,
          value: item.value === null ? '—' : this.valueFormatter()(item.value),
          share: this.percentFormatter()(Number((ring.share * 100).toFixed(1))),
          color: ring.color,
          raw: item.value,
          seriesIndex: index,
          active: true,
        },
      ],
      index,
      x: at.x,
      y: at.y,
      placement,
    };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const parts = this.list().map((item) => `${item.label} ${this.percentFormatter()(Number((radialShare(item.value, item.max ?? this.max()) * 100).toFixed(1)))}`);
    const text = `${chartSummary(t, this.intl(), t.chartRadialBar, 1, this.list().length, null)}: ${parts.join(', ')}`;
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() => {
    const t = this.translations();
    return {
      columns: [
        { key: 'value', label: t.chartValue },
        { key: 'share', label: t.chartShare },
      ],
      rows: this.list().map((item) => ({
        label: item.label,
        cells: [item.value === null ? '—' : this.valueFormatter()(item.value), this.percentFormatter()(Number((radialShare(item.value, item.max ?? this.max()) * 100).toFixed(1)))],
      })),
    };
  });

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
    afterRenderEffect(() => {
      this.dt();
      const next = readTokenNumber(this.host.nativeElement, '--tx-chart-radial-bar-thickness', DEFAULT_THICKNESS);
      if (next !== this.thickness()) this.thickness.set(next);
    });
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.hovered.set(null);
      return;
    }
    const index = this.ringAt(event.x, event.y);
    this.fromLegend.set(false);
    this.hovered.set(index);
    if (event.type === 'click' && index !== null) {
      this.barClick.emit(this.event(index));
    }
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.hovered.set(null);
      return;
    }
    const visible = this.visibleIndexes();
    if (!visible.length) return;
    const current = this.hovered();
    const at = current === null ? -1 : visible.indexOf(current);
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1 : at < 0 ? (forward ? 0 : visible.length - 1) : (at + (forward ? 1 : -1) + visible.length) % visible.length;
    const index = visible[next];
    this.fromLegend.set(false);
    this.hovered.set(index);
    const item = this.list()[index];
    const share = radialShare(item.value, item.max ?? this.max());
    this.frame()?.announce(`${item.label}: ${item.value === null ? '—' : this.valueFormatter()(item.value)}, ${this.percentFormatter()(Number((share * 100).toFixed(1)))}`);
  }

  onLegendToggle(key: string): void {
    const index = this.keys().indexOf(key);
    this.hidden.update((keys) => toggleKey(keys, key));
    this.hovered.set(null);
    this.barToggle.emit({ index, label: this.list()[index]?.label ?? '', hidden: this.hidden().has(key) });
  }

  onLegendHover(key: string | null): void {
    const index = key === null ? -1 : this.keys().indexOf(key);
    this.fromLegend.set(index >= 0);
    this.hovered.set(index >= 0 && !this.hidden().has(key ?? '') ? index : null);
  }

  private centerText(ring: TxRadialBarRing): string {
    return this.centerValue() === 'value' ? this.valueFormatter()(ring.value) : this.percentFormatter()(Number((ring.share * 100).toFixed(1)));
  }

  private event(index: number): TxRadialBarEvent {
    const item = this.list()[index];
    return { index, label: item.label, value: item.value, share: radialShare(item.value, item.max ?? this.max()) };
  }

  private ringAt(x: number, y: number): number | null {
    const fit = this.fit();
    const [start, end] = this.span();
    const distance = Math.hypot(x - fit.cx, y - fit.cy);
    if (end - start < Math.PI * 2 - 1e-6 && angleFrom(x, y, fit.cx, fit.cy, start) > end + 0.05) return null;
    const ring = this.rings().find((item) => Math.abs(distance - item.radius) <= item.width / 2 + HIT_SLACK);
    return ring ? ring.index : null;
  }
}
