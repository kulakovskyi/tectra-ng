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
  TxChartHoverBand,
  TxChartGridMode,
  TxChartHeight,
  TxChartPointerEvent,
  TxChartTooltipData,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  cartesianLayout,
  chartBandRect,
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
import { bulletMax, bulletSegments } from './bullet-layout';
import { TxBulletChartPart, TxBulletEvent, TxBulletItem, TxBulletRow } from './bullet-chart.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { BULLET_ICON_DEFAULTS } from './bullet.icons';

const DEFAULTS = { rowHeight: 44, trackHeight: 0.5, barHeight: 0.34, targetHeight: 0.72 };
const LEVELS = 3;
const AXIS_ROOM = 30;

@Component({
  selector: 'tx-bullet-chart',
  imports: [TxChartFrame, TxChartAxes, TxChartHoverBand],
  templateUrl: './bullet-chart.component.html',
  styleUrl: './bullet-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-bullet-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-bullet-chart--fill]': 'typeof height() === "string"',
    '[class.tx-bullet-chart--entering]': 'entrance.active()',
    '[class.tx-bullet-chart--morph]': 'morph()',
    '[class.tx-bullet-chart--active]': 'active() !== null',
  },
  viewProviders: [provideTxIconDefaults(BULLET_ICON_DEFAULTS)],
})
export class TxBulletChart {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly items = input<readonly TxBulletItem[] | null | undefined>([]);
  readonly ranges = input<readonly number[]>([]);
  readonly min = input(0);
  readonly max = input<number | undefined>(undefined);
  readonly height = input<TxChartHeight | undefined>(undefined);
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly grid = input<TxChartGridMode>('value');
  readonly maxLabelWidth = input(180);
  readonly toolbar = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxBulletChartPart, TxBulletChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly barClick = output<TxBulletEvent>();

  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('bulletChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);
  readonly active = signal<number | null>(null);
  readonly geometry = signal(DEFAULTS);

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly list = computed(() => this.items() ?? []);
  readonly isEmpty = computed(() => !this.list().length);
  readonly frameHeight = computed<TxChartHeight>(() => this.height() ?? Math.max(1, this.list().length) * this.geometry().rowHeight + AXIS_ROOM);
  readonly size = linkedSignal(() => initialChartSize(this.frameHeight(), null, undefined, this.toolbar()));

  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));

  readonly domainMax = computed(() => {
    const own = this.max();
    if (own !== undefined) return own;
    return bulletMax(this.list().flatMap((item) => [item.value, item.target, ...(item.ranges ?? this.ranges())]));
  });

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const labels = this.list().map((item) => item.label);
    return cartesianLayout({
      width,
      height,
      intl: this.intl(),
      horizontal: true,
      category: { kind: 'band', labels, count: labels.length, maxLabelWidth: this.maxLabelWidth() },
      value: { extent: [this.min(), Math.max(this.min() + 1e-9, this.domainMax())], format: this.valueFormat(), includeZero: this.min() <= 0, min: this.min(), max: this.max() },
      grid: this.grid(),
    });
  });

  readonly rows = computed<TxBulletRow[]>(() => {
    const layout = this.layout();
    const band = layout.category as TxBandScale;
    const scale = layout.value;
    const [d0, d1] = scale.domain;
    const { trackHeight, barHeight, targetHeight } = this.geometry();
    const clamp = (value: number) => Math.max(d0, Math.min(d1, value));
    return this.list().map((item, index) => {
      const center = band.center(index);
      const track = band.bandwidth * trackHeight;
      const bar = band.bandwidth * barHeight;
      const tick = band.bandwidth * targetHeight;
      const value = item.value !== null && Number.isFinite(item.value) ? item.value : null;
      const target = item.target !== null && item.target !== undefined && Number.isFinite(item.target) ? item.target : null;
      const zero = scale.map(clamp(Math.max(d0, 0)));
      const end = value === null ? zero : scale.map(clamp(value));
      return {
        index,
        key: `${index}:${item.label}`,
        label: item.label,
        value,
        target,
        color: item.color ?? null,
        trackY: center - track / 2,
        trackHeight: track,
        ranges: bulletSegments(item.ranges ?? this.ranges(), d0, d1, LEVELS).map((segment) => ({
          key: `${segment.level}:${segment.from}`,
          level: segment.level,
          x: scale.map(segment.from),
          width: Math.max(0, scale.map(segment.to) - scale.map(segment.from)),
        })),
        barX: Math.min(zero, end),
        barY: center - bar / 2,
        barWidth: Math.abs(end - zero),
        barHeight: bar,
        targetX: target === null ? null : scale.map(clamp(target)),
        targetY1: center - tick / 2,
        targetY2: center + tick / 2,
        center,
      };
    });
  });

  readonly hoverBand = computed(() => {
    const index = this.active();
    return index === null ? null : chartBandRect(this.layout().category as TxBandScale, index, this.layout().plot, true);
  });

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const index = this.active();
    if (index === null || !this.showTooltip()) return null;
    const row = this.rows()[index];
    if (!row) return null;
    const t = this.translations();
    const format = this.valueFormatter();
    const rows = [
      { label: t.chartValue, value: row.value === null ? '—' : format(row.value), color: row.color ?? 'var(--tx-chart-bullet-bar-color)', raw: row.value, seriesIndex: 0, active: true },
      ...(row.target !== null ? [{ label: t.chartTarget, value: format(row.target), color: 'var(--tx-chart-bullet-target-color)', raw: row.target, seriesIndex: 1 }] : []),
    ];
    return { title: row.label, rows, index, x: row.barX + row.barWidth, y: row.trackY, placement: 'top' };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const text = chartSummary(t, this.intl(), t.chartBullet, 1, this.list().length, null);
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() => {
    const t = this.translations();
    const format = this.valueFormatter();
    return {
      columns: [
        { key: 'value', label: t.chartValue },
        { key: 'target', label: t.chartTarget },
      ],
      rows: this.rows().map((row) => ({ label: row.label, cells: [row.value === null ? '—' : format(row.value), row.target === null ? '—' : format(row.target)] })),
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
    const layout = this.layout();
    const plot = layout.plot;
    const inside = event.y >= plot.top && event.y <= plot.top + plot.height && event.x >= plot.left - 4 && event.x <= plot.left + plot.width + 4;
    const index = inside ? (layout.category as TxBandScale).indexAt(event.y) : -1;
    this.active.set(index >= 0 ? index : null);
    if (event.type === 'click' && index >= 0) {
      const row = this.rows()[index];
      this.barClick.emit({ index, label: row.label, value: row.value, target: row.target });
    }
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.active.set(null);
      return;
    }
    const key = event.key === 'ArrowDown' ? 'ArrowRight' : event.key === 'ArrowUp' ? 'ArrowLeft' : event.key;
    const index = stepIndex(key, this.active() ?? -1, this.rows().length);
    if (index < 0) return;
    this.active.set(index);
    const row = this.rows()[index];
    const t = this.translations();
    const format = this.valueFormatter();
    const target = row.target === null ? '' : `, ${t.chartTarget.toLocaleLowerCase(this.intl())} ${format(row.target)}`;
    this.frame()?.announce(`${row.label}: ${row.value === null ? '—' : format(row.value)}${target}`);
  }

  private readGeometry(): void {
    const element = this.host.nativeElement;
    const next = {
      rowHeight: readTokenNumber(element, '--tx-chart-bullet-row-height', DEFAULTS.rowHeight),
      trackHeight: readTokenNumber(element, '--tx-chart-bullet-track-height', DEFAULTS.trackHeight),
      barHeight: readTokenNumber(element, '--tx-chart-bullet-bar-height', DEFAULTS.barHeight),
      targetHeight: readTokenNumber(element, '--tx-chart-bullet-target-height', DEFAULTS.targetHeight),
    };
    const current = this.geometry();
    if ((Object.keys(next) as (keyof typeof next)[]).some((key) => next[key] !== current[key])) {
      this.geometry.set(next);
    }
  }
}
