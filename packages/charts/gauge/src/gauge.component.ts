import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, afterRenderEffect, booleanAttribute, computed, inject, input, linkedSignal, signal } from '@angular/core';
import {
  TxChartFrame,
  TxChartHeight,
  TxChartValueFormat,
  arcBounds,
  arcSpan,
  chartNumberFormatter,
  initialChartSize,
  injectChartEntrance,
  linearTicks,
  polar,
  readTokenNumber,
  strokeArc,
  textWidth,
  tickFormatter,
} from '@tectra-ng/charts/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, formatMessage, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { gaugeAngle, gaugeNeedle } from './gauge-layout';
import { TxGaugeArc, TxGaugeBand, TxGaugePart, TxGaugeTick, TxGaugeTone } from './gauge.types';

const DEFAULTS = { thickness: 0.16, bandGap: 2, needleWidth: 6, hubRadius: 6, tickLength: 6, tickFontSize: 11 };
const PADDING = 6;
const TICK_GAP = 4;
const MIN_RADIUS = 8;
const VALUE_GAP = 8;
const LABEL_GAP = 6;

@Component({
  selector: 'tx-gauge',
  imports: [TxChartFrame],
  templateUrl: './gauge.component.html',
  styleUrl: './gauge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-gauge',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-mode]': 'hasNeedle() ? "needle" : "progress"',
    '[class.tx-gauge--fill]': 'typeof height() === "string"',
    '[class.tx-gauge--entering]': 'entrance.active()',
    '[class.tx-gauge--morph]': 'morph()',
  },
})
export class TxGauge {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly value = input<number | null | undefined>(null);
  readonly min = input(0);
  readonly max = input(100);
  readonly bands = input<readonly TxGaugeBand[] | null | undefined>([]);
  readonly needle = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly tone = input<TxGaugeTone>('primary');
  readonly color = input<string | undefined>(undefined);
  readonly startAngle = input(-120);
  readonly endAngle = input(120);
  readonly label = input('');
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly ticks = input(5);
  readonly showTicks = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showValue = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly height = input<TxChartHeight>(220);
  readonly toolbar = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxGaugePart, TxGauge> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('gauge', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);
  readonly geometry = signal(DEFAULTS);

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly size = linkedSignal(() => initialChartSize(this.height(), null, undefined, this.toolbar()));
  readonly bandList = computed(() => this.bands() ?? []);
  readonly hasNeedle = computed(() => this.needle() ?? this.bandList().length > 0);
  readonly isEmpty = computed(() => {
    const value = this.value();
    return value === null || value === undefined || !Number.isFinite(value) || !(this.max() > this.min());
  });

  readonly span = computed(() => arcSpan(this.startAngle(), this.endAngle()));

  readonly tickValues = computed(() => (this.showTicks() ? linearTicks(this.min(), this.max(), Math.max(1, this.ticks())) : []));
  readonly tickFormat = computed(() => tickFormatter(this.intl(), this.tickValues(), this.valueFormat()));
  readonly tickRoom = computed(() => {
    const values = this.tickValues();
    if (!values.length) return 0;
    const { tickLength, tickFontSize } = this.geometry();
    const widest = Math.max(...values.map((value) => textWidth(this.tickFormat()(value), tickFontSize)));
    return TICK_GAP + tickLength + TICK_GAP + Math.max(widest, tickFontSize);
  });

  readonly fit = computed(() => {
    const { width, height } = this.size();
    const [start, end] = this.span();
    const bounds = arcBounds(start, end);
    const room = this.tickRoom();
    const below = (radius: number) => Math.max(bounds.maxY * (radius + room), this.textBelow(radius));
    const fits = (radius: number) =>
      (bounds.maxX - bounds.minX) * (radius + room) <= width - PADDING * 2 && -bounds.minY * (radius + room) + below(radius) <= height - PADDING * 2;
    let low = MIN_RADIUS;
    let high = Math.max(MIN_RADIUS, Math.min(width, height));
    for (let step = 0; step < 24; step++) {
      const middle = (low + high) / 2;
      if (fits(middle)) low = middle;
      else high = middle;
    }
    const top = -bounds.minY * (low + room);
    const used = top + below(low);
    return {
      cx: width / 2 - ((bounds.minX + bounds.maxX) / 2) * (low + room),
      cy: PADDING + (height - PADDING * 2 - used) / 2 + top,
      radius: low,
    };
  });
  readonly width = computed(() => Math.max(2, this.fit().radius * this.geometry().thickness));
  readonly arcRadius = computed(() => this.fit().radius - this.width() / 2);

  readonly angle = computed(() => gaugeAngle(this.value() ?? null, this.min(), this.max(), this.span()[0], this.span()[1]));

  readonly track = computed(() => {
    const fit = this.fit();
    const [start, end] = this.span();
    return strokeArc(fit.cx, fit.cy, this.arcRadius(), start, end);
  });

  readonly progress = computed(() => {
    if (this.hasNeedle() || this.isEmpty()) return '';
    const fit = this.fit();
    const start = this.span()[0];
    const angle = this.angle();
    return angle > start ? strokeArc(fit.cx, fit.cy, this.arcRadius(), start, Math.max(start + 1e-3, angle)) : '';
  });

  readonly progressColor = computed(() => this.color() ?? `var(--tx-chart-gauge-${this.tone()}-color)`);

  readonly bandArcs = computed<TxGaugeArc[]>(() => {
    const fit = this.fit();
    const [start, end] = this.span();
    const radius = this.arcRadius();
    const gap = this.bandList().length > 1 ? this.geometry().bandGap / Math.max(1, radius) / 2 : 0;
    return this.bandList().flatMap((band, index) => {
      const from = gaugeAngle(Math.min(band.from, band.to), this.min(), this.max(), start, end);
      const to = gaugeAngle(Math.max(band.from, band.to), this.min(), this.max(), start, end);
      const a = from > start + 1e-6 ? from + gap : from;
      const b = to < end - 1e-6 ? to - gap : to;
      if (b <= a) return [];
      return [{ key: `${index}:${band.from}:${band.to}`, path: strokeArc(fit.cx, fit.cy, radius, a, b), color: band.color ?? `var(--tx-chart-gauge-${band.tone ?? 'neutral'}-color)`, label: band.label ?? null }];
    });
  });

  readonly tickMarks = computed<TxGaugeTick[]>(() => {
    const fit = this.fit();
    const [start, end] = this.span();
    const { tickLength, tickFontSize } = this.geometry();
    const outer = fit.radius + TICK_GAP;
    const format = this.tickFormat();
    return this.tickValues().map((value) => {
      const angle = gaugeAngle(value, this.min(), this.max(), start, end);
      const from = polar(fit.cx, fit.cy, outer, angle);
      const to = polar(fit.cx, fit.cy, outer + tickLength, angle);
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const text = polar(fit.cx, fit.cy, outer + tickLength + TICK_GAP + (Math.abs(cos) > 0.3 ? tickFontSize * 0.5 * Math.abs(cos) : 0), angle);
      return { value, x1: from.x, y1: from.y, x2: to.x, y2: to.y, labelX: text.x, labelY: text.y, label: format(value), anchor: sin > 0.3 ? 'start' : sin < -0.3 ? 'end' : 'middle' };
    });
  });

  readonly needlePath = computed(() => {
    const fit = this.fit();
    const length = fit.radius - this.width() * 0.5;
    return gaugeNeedle(fit.cx, fit.cy, length, this.geometry().needleWidth);
  });

  readonly needleRotation = computed(() => `${(this.angle() * 180) / Math.PI}deg`);
  readonly startRotation = computed(() => `${this.startAngle()}deg`);

  readonly formatted = computed(() => {
    const value = this.value();
    return value === null || value === undefined || !Number.isFinite(value) ? '—' : chartNumberFormatter(this.intl(), this.valueFormat())(value);
  });

  readonly valueFont = computed(() => this.fontsFor(this.fit().radius));
  readonly valueY = computed(() => this.fit().cy + this.valueOffset(this.fit().radius));

  readonly summary = computed(() => {
    const t = this.translations();
    const format = chartNumberFormatter(this.intl(), this.valueFormat());
    const band = this.bandList().find((item) => {
      const value = this.value();
      return value !== null && value !== undefined && value >= Math.min(item.from, item.to) && value <= Math.max(item.from, item.to);
    });
    const head = [this.ariaLabel(), t.chartGauge, this.label()].filter(Boolean).join(', ');
    const value = formatMessage(t.chartGaugeValue, { value: this.formatted(), min: format(this.min()), max: format(this.max()) }, this.intl());
    return `${head}: ${value}${band?.label ? `, ${band.label}` : ''}`;
  });

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
    afterRenderEffect(() => {
      this.dt();
      this.readGeometry();
    });
  }

  private fontsFor(radius: number): { value: number; label: number } {
    return { value: Math.max(14, Math.min(34, radius * 0.24)), label: Math.max(10, Math.min(14, radius * 0.1)) };
  }

  private valueOffset(radius: number): number {
    const font = this.fontsFor(radius).value;
    return this.hasNeedle() ? this.geometry().hubRadius + VALUE_GAP + font * 0.8 : font * 0.3;
  }

  private textBelow(radius: number): number {
    if (!this.showValue()) return this.hasNeedle() ? this.geometry().hubRadius : 0;
    const fonts = this.fontsFor(radius);
    return this.valueOffset(radius) + (this.label() ? LABEL_GAP + fonts.label * 1.25 : fonts.value * 0.25);
  }

  private readGeometry(): void {
    const element = this.host.nativeElement;
    const next = {
      thickness: readTokenNumber(element, '--tx-chart-gauge-thickness', DEFAULTS.thickness),
      bandGap: readTokenNumber(element, '--tx-chart-gauge-band-gap', DEFAULTS.bandGap),
      needleWidth: readTokenNumber(element, '--tx-chart-gauge-needle-width', DEFAULTS.needleWidth),
      hubRadius: readTokenNumber(element, '--tx-chart-gauge-hub-radius', DEFAULTS.hubRadius),
      tickLength: readTokenNumber(element, '--tx-chart-gauge-tick-length', DEFAULTS.tickLength),
      tickFontSize: readTokenNumber(element, '--tx-chart-gauge-tick-label-font-size', DEFAULTS.tickFontSize),
    };
    const current = this.geometry();
    if ((Object.keys(next) as (keyof typeof next)[]).some((key) => next[key] !== current[key])) {
      this.geometry.set(next);
    }
  }
}
