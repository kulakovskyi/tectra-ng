import {
  ChangeDetectionStrategy,
  Component,
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
  TxChartAxes,
  TxChartFrame,
  TxChartHeight,
  TxChartLegendAlign,
  TxChartLegendItem,
  TxChartLegendPosition,
  TxChartLegendTemplate,
  TxChartLegendVariant,
  TxChartPointerEvent,
  TxChartTooltipData,
  TxChartTooltipTemplate,
  cartesianLayout,
  chartSummary,
  dateFormat,
  initialChartSize,
  injectChartEntrance,
  linePath,
  toTime,
  toggleKey,
} from '@tectra-ng/charts/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { rankLineColor, rankTickStep, rankTimeExtent, rankY } from './rank-line-layout';
import { TxRankLineEvent, TxRankLinePart, TxRankMarker, TxRankSeries } from './rank-line.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { RANK_LINE_ICON_DEFAULTS } from './rank-line.icons';
import { RANK_LINE_THEME } from './rank-line.theme';

const HIT_DISTANCE = 24;

@Component({
  selector: 'tx-rank-chart',
  imports: [TxChartFrame, TxChartAxes],
  templateUrl: './rank-line.component.html',
  styleUrl: './rank-line.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-rank-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-rank-chart--entering]': 'entrance.active()',
    '[class.tx-rank-chart--hovering]': 'active() !== null',
  },
  viewProviders: [provideTxIconDefaults(RANK_LINE_ICON_DEFAULTS)],
})
export class TxRankChart {
  private readonly rankLineTheme = injectTokens(RANK_LINE_THEME);

  private locale = inject(TxLocaleService);
  readonly translations = injectTranslations();

  readonly series = input<readonly TxRankSeries[] | null | undefined>([]);
  readonly maxRank = input(20);
  readonly rankLabel = input('');
  readonly height = input<TxChartHeight>(360);
  readonly showLegend = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly legendPosition = input<TxChartLegendPosition>('top');
  readonly legendAlign = input<TxChartLegendAlign>('start');
  readonly legendVariant = input<TxChartLegendVariant>('line');
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxRankLinePart, TxRankChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly pointClick = output<TxRankLineEvent>();
  readonly seriesToggle = output<{ index: number; name: string; hidden: boolean }>();

  readonly legendTemplate = contentChild(TxChartLegendTemplate);
  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('rankChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();

  readonly hidden = signal<ReadonlySet<string>>(new Set());
  readonly active = signal<string | null>(null);
  readonly legendShown = computed(() => this.showLegend() && (this.series() ?? []).length > 0);
  readonly size = linkedSignal(() => initialChartSize(this.height(), this.legendShown() ? this.legendPosition() : null));

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly list = computed(() => this.series() ?? []);
  readonly keys = computed(() => this.list().map((item, index) => `${index}:${item.name}`));
  readonly colors = computed(() => this.list().map((item, index) => item.color || rankLineColor(index)));
  readonly extent = computed(() => rankTimeExtent(this.list()));
  readonly isEmpty = computed(() => !this.list().some((item) => item.points.some((point) => point.rank !== null && toTime(point.time) !== null)));
  readonly dateTimeFormat = computed(() => dateFormat(this.intl(), { dateStyle: 'medium', timeStyle: 'short' }));

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const maxRank = Math.max(1, this.maxRank());
    const base = cartesianLayout({
      width,
      height,
      intl: this.intl(),
      category: { kind: 'time', domain: this.extent() ?? [0, 1] },
      value: { extent: [0, maxRank], min: 0, max: maxRank, tickCount: Math.ceil(maxRank / rankTickStep(maxRank)), format: (value: number) => String(Math.max(1, Math.round(value))) },
      grid: 'value',
    });
    const { plot } = base;
    const mirror = (y: number) => plot.top * 2 + plot.height - y;
    const axes = {
      ...base.axes,
      grid: base.axes.grid.map((line) => ({ ...line, y1: mirror(line.y1), y2: mirror(line.y2) })),
      axes: base.axes.axes.map((axis) =>
        axis.position === 'left' || axis.position === 'right' ? { ...axis, labels: axis.labels.map((label) => ({ ...label, y: mirror(label.y) })) } : axis,
      ),
    };
    return { plot, axes, x: (time: number) => base.categoryPosition(0, time), maxRank };
  });

  readonly lines = computed(() => {
    const { plot, x, maxRank } = this.layout();
    const hidden = this.hidden();
    return this.list().flatMap((item, series) => {
      const key = this.keys()[series];
      if (hidden.has(key)) return [];
      const markers: TxRankMarker[] = [];
      const points = item.points.map((point, index) => {
        const time = toTime(point.time);
        if (time === null || point.rank === null || !Number.isFinite(point.rank)) return null;
        const marker = { key: `${series}-${index}`, series, point: index, x: x(time), y: rankY(point.rank, maxRank, plot.top, plot.height), time, rank: point.rank, note: point.note };
        markers.push(marker);
        return { x: marker.x, y: marker.y };
      });
      return [{ key, series, color: this.colors()[series], path: linePath(points, 'straight'), markers }];
    });
  });

  readonly markers = computed(() => this.lines().flatMap((line) => line.markers).sort((a, b) => a.time - b.time || a.series - b.series));
  readonly activeMarker = computed(() => this.markers().find((marker) => marker.key === this.active()) ?? null);

  readonly legendItems = computed<TxChartLegendItem[]>(() =>
    this.list().map((item, index) => ({ key: this.keys()[index], label: item.name, color: this.colors()[index], hidden: this.hidden().has(this.keys()[index]) })),
  );

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const marker = this.activeMarker();
    if (!marker || !this.showTooltip()) return null;
    const item = this.list()[marker.series];
    return {
      title: this.dateTimeFormat().format(marker.time),
      rows: [{ label: item.name, value: this.rankLabel() ? `${this.rankLabel()}: ${marker.rank}` : String(marker.rank), color: this.colors()[marker.series], raw: marker.rank, seriesIndex: marker.series, active: true }],
      index: marker.point,
      x: marker.x,
      y: marker.y,
      placement: 'top',
      note: marker.note,
    };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const extent = this.extent();
    const format = this.dateTimeFormat();
    const text = chartSummary(t, this.intl(), t.chartRank, this.list().length, this.markers().length, extent ? [format.format(extent[0]), format.format(extent[1])] : null);
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() => {
    const t = this.translations();
    const format = this.dateTimeFormat();
    return {
      columns: [{ key: 'rank', label: this.rankLabel() || t.chartRankValue }],
      rows: this.markers().map((marker) => ({
        label: `${this.list()[marker.series].name}, ${format.format(marker.time)}`,
        cells: [marker.note ? `${marker.rank} (${marker.note})` : String(marker.rank)],
      })),
    };
  });

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.active.set(null);
      return;
    }
    let best: TxRankMarker | null = null;
    let distance = HIT_DISTANCE;
    for (const marker of this.markers()) {
      const next = Math.hypot(marker.x - event.x, marker.y - event.y);
      if (next <= distance) {
        distance = next;
        best = marker;
      }
    }
    this.active.set(best?.key ?? null);
    if (event.type === 'click' && best) {
      this.pointClick.emit({ seriesIndex: best.series, pointIndex: best.point, name: this.list()[best.series].name, time: best.time, rank: best.rank, note: best.note });
    }
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.active.set(null);
      return;
    }
    const markers = this.markers();
    if (!markers.length) return;
    const current = this.activeMarker();
    let next: TxRankMarker | undefined;
    if (event.key === 'Home') next = markers[0];
    else if (event.key === 'End') next = markers[markers.length - 1];
    else if (!current) next = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? markers[markers.length - 1] : markers[0];
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const series = [...new Set(markers.map((marker) => marker.series))].sort((a, b) => a - b);
      const target = series[(series.indexOf(current.series) + (event.key === 'ArrowDown' ? 1 : -1) + series.length) % series.length];
      next = markers
        .filter((marker) => marker.series === target)
        .reduce<TxRankMarker | undefined>((best, marker) => (!best || Math.abs(marker.time - current.time) < Math.abs(best.time - current.time) ? marker : best), undefined);
    } else {
      const own = markers.filter((marker) => marker.series === current.series);
      const at = own.indexOf(current);
      next = own[Math.min(own.length - 1, Math.max(0, at + (event.key === 'ArrowRight' ? 1 : -1)))];
    }
    if (!next) return;
    this.active.set(next.key);
    const name = this.list()[next.series].name;
    this.frame()?.announce(`${name}, ${this.dateTimeFormat().format(next.time)}: ${this.rankLabel() || this.translations().chartRankValue} ${next.rank}${next.note ? `, ${next.note}` : ''}`);
  }

  onLegendToggle(key: string): void {
    const index = this.keys().indexOf(key);
    this.hidden.update((keys) => toggleKey(keys, key));
    this.active.set(null);
    this.seriesToggle.emit({ index, name: this.list()[index]?.name ?? '', hidden: this.hidden().has(key) });
  }
}
