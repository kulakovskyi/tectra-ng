import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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
  TxChartTooltipPlacement,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  arcPath,
  chartNumberFormatter,
  initialChartSize,
  injectChartEntrance,
  polar,
  readTokenNumber,
  textWidth,
} from '@tectra-ng/charts/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { sunburstArcAt, sunburstArcs, sunburstFocus, sunburstValue } from './sunburst-layout';
import { TxSunburstArc, TxSunburstChartPart, TxSunburstEvent, TxSunburstItem } from './sunburst-chart.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { SUNBURST_ICON_DEFAULTS } from './sunburst.icons';

const DEFAULTS = { hole: 0.3, corner: 3, fontSize: 11 };
const PADDING = 6;
const CENTER = 'center';

@Component({
  selector: 'tx-sunburst-chart',
  imports: [TxChartFrame],
  templateUrl: './sunburst-chart.component.html',
  styleUrl: './sunburst-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-sunburst-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-sunburst-chart--fill]': 'typeof height() === "string"',
    '[class.tx-sunburst-chart--entering]': 'entrance.active()',
    '[class.tx-sunburst-chart--active]': 'activeArc() !== null',
  },
  viewProviders: [provideTxIconDefaults(SUNBURST_ICON_DEFAULTS)],
})
export class TxSunburstChart {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly data = input<TxSunburstItem | readonly TxSunburstItem[] | null | undefined>([]);
  readonly levels = input(3);
  readonly height = input<TxChartHeight>(380);
  readonly showLabels = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly drill = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly totalLabel = input('');
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSunburstChartPart, TxSunburstChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly segmentClick = output<TxSunburstEvent>();
  readonly focusChange = output<string[]>();

  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('sunburstChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly geometry = signal(DEFAULTS);

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly roots = computed<readonly TxSunburstItem[]>(() => {
    const data = this.data();
    return !data ? [] : Array.isArray(data) ? data : [data as TxSunburstItem];
  });
  readonly focus = linkedSignal<readonly TxSunburstItem[], number[]>({ source: this.roots, computation: () => [] });
  readonly active = signal<string | null>(null);
  readonly size = linkedSignal(() => initialChartSize(this.height(), null, undefined, this.toolbar()));
  readonly isEmpty = computed(() => !this.roots().some((item) => sunburstValue(item) > 0));

  readonly fit = computed(() => {
    const { width, height } = this.size();
    return { cx: width / 2, cy: height / 2, radius: Math.max(10, Math.min(width, height) / 2 - PADDING) };
  });

  readonly arcs = computed(() => sunburstArcs(this.roots(), { levels: this.levels(), radius: this.fit().radius, hole: this.geometry().hole, focus: this.focus() }));
  readonly inner = computed(() => this.fit().radius * Math.min(0.9, Math.max(0, this.geometry().hole)));
  readonly holeRadius = computed(() => Math.max(0, this.inner() - 2));
  readonly trail = computed(() => sunburstFocus(this.roots(), this.focus()).trail);
  readonly activeArc = computed(() => {
    const key = this.active();
    return key && key !== CENTER ? (this.arcs().find((arc) => arc.key === key) ?? null) : null;
  });

  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));
  readonly percentFormatter = computed(() => {
    const format = chartNumberFormatter(this.intl(), 'percent');
    return (share: number) => format(Number((share * 100).toFixed(1)));
  });

  readonly segments = computed(() => {
    const { cx, cy } = this.fit();
    const corner = this.geometry().corner;
    const fontSize = this.geometry().fontSize;
    return this.arcs().map((arc) => {
      const middle = (arc.start + arc.end) / 2;
      const radius = (arc.inner + arc.outer) / 2;
      const at = polar(cx, cy, radius, middle);
      const room = (arc.end - arc.start) * radius;
      const fits = this.showLabels() && room >= textWidth(arc.label, fontSize) + 8 && arc.outer - arc.inner >= fontSize + 6;
      return {
        ...arc,
        d: arcPath(cx, cy, arc.inner, arc.outer, arc.start, arc.end, corner),
        fill: arc.depth > 1 ? `color-mix(in srgb, ${arc.base} calc(100% - ${arc.depth - 1} * var(--tx-chart-sunburst-level-fade, 22%)), var(--tx-chart-sunburst-fade-base, transparent))` : arc.base,
        labelX: at.x,
        labelY: at.y,
        text: fits ? arc.label : null,
      };
    });
  });

  readonly center = computed(() => {
    const t = this.translations();
    const trail = this.trail();
    const focused = trail[trail.length - 1];
    const value = focused ? sunburstValue(focused) : this.roots().reduce((sum, item) => sum + sunburstValue(item), 0);
    return { label: focused?.label ?? (this.totalLabel() || t.chartTotal), value: this.valueFormatter()(value), canGoUp: trail.length > 0 && this.drill() };
  });

  readonly centerFont = computed(() => {
    const inner = this.inner();
    return { value: Math.max(12, Math.min(24, inner * 0.32)), label: Math.max(10, Math.min(13, inner * 0.17)) };
  });

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const arc = this.activeArc();
    if (!arc || !this.showTooltip()) return null;
    const t = this.translations();
    const { cx, cy } = this.fit();
    const middle = (arc.start + arc.end) / 2;
    const at = polar(cx, cy, arc.outer + 2, middle);
    const sin = Math.sin(middle);
    const cos = Math.cos(middle);
    const placement: TxChartTooltipPlacement = Math.abs(sin) >= Math.SQRT1_2 ? (sin > 0 ? 'right' : 'left') : cos > 0 ? 'top' : 'bottom';
    const names = this.names(arc.path);
    return {
      title: names.slice(0, -1).join(' / '),
      rows: [
        { label: arc.label, value: this.valueFormatter()(arc.value), color: arc.base, raw: arc.value, seriesIndex: 0, active: true },
        ...(arc.depth > 1 || this.focus().length ? [{ label: t.chartOfParent, value: this.percentFormatter()(arc.parentShare), color: 'transparent', raw: arc.parentShare, seriesIndex: 1 }] : []),
        { label: t.chartOfTotal, value: this.percentFormatter()(arc.share), color: 'transparent', raw: arc.share, seriesIndex: 2 },
      ],
      index: 0,
      x: at.x,
      y: at.y,
      placement,
    };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const top = this.arcs().filter((arc) => arc.depth === 1);
    const parts = top.map((arc) => `${arc.label} ${this.percentFormatter()(arc.share)}`);
    const text = `${t.chartSunburst}, ${this.center().label} ${this.center().value}: ${parts.join(', ')}`;
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() => {
    const t = this.translations();
    return {
      columns: [
        { key: 'value', label: t.chartValue },
        { key: 'share', label: t.chartOfTotal },
      ],
      rows: this.arcs().map((arc) => ({ label: this.names(arc.path).join(' / '), cells: [this.valueFormatter()(arc.value), this.percentFormatter()(arc.share)] })),
    };
  });

  constructor() {
    afterRenderEffect(() => {
      this.dt();
      this.readGeometry();
    });
  }

  isLit(key: string): boolean {
    const active = this.activeArc();
    return !active || active.key === key || active.key.startsWith(`${key}.`);
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.active.set(null);
      return;
    }
    const { cx, cy } = this.fit();
    const inCenter = Math.hypot(event.x - cx, event.y - cy) < this.inner();
    const arc = inCenter ? null : sunburstArcAt(this.arcs(), event.x, event.y, cx, cy);
    this.active.set(inCenter && this.center().canGoUp ? CENTER : (arc?.key ?? null));
    if (event.type !== 'click') return;
    if (inCenter) this.up();
    else if (arc) this.select(arc);
  }

  onNavigate(event: KeyboardEvent): void {
    const arcs = this.arcs();
    if (!arcs.length) return;
    const current = this.activeArc();
    if (event.key === 'Escape' || event.key === 'Backspace') {
      if (current) this.active.set(null);
      else this.up();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      if (current) this.select(current);
      return;
    }
    let next: TxSunburstArc | undefined;
    if (!current) {
      next = arcs.find((arc) => arc.depth === 1);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const siblings = arcs.filter((arc) => arc.depth === current.depth && arc.path.slice(0, -1).join('.') === current.path.slice(0, -1).join('.'));
      const at = siblings.indexOf(current);
      next = siblings[(at + (event.key === 'ArrowRight' ? 1 : -1) + siblings.length) % siblings.length];
    } else if (event.key === 'ArrowDown') {
      next = arcs.find((arc) => arc.depth === current.depth + 1 && arc.key.startsWith(`${current.key}.`)) ?? current;
    } else if (event.key === 'ArrowUp') {
      next = arcs.find((arc) => arc.key === current.path.slice(0, -1).join('.')) ?? current;
    } else if (event.key === 'Home' || event.key === 'End') {
      const top = arcs.filter((arc) => arc.depth === 1);
      next = event.key === 'Home' ? top[0] : top[top.length - 1];
    }
    if (!next) return;
    this.active.set(next.key);
    this.frame()?.announce(`${this.names(next.path).join(' / ')}: ${this.valueFormatter()(next.value)}, ${this.percentFormatter()(next.share)}`);
  }

  up(): void {
    if (!this.focus().length || !this.drill()) return;
    this.focus.update((path) => path.slice(0, -1));
    this.afterDrill();
  }

  private select(arc: TxSunburstArc): void {
    this.segmentClick.emit({ path: this.names(arc.path), value: arc.value, item: arc.item });
    if (!this.drill() || !arc.hasChildren) return;
    this.focus.set(arc.path);
    this.afterDrill();
  }

  private afterDrill(): void {
    this.active.set(null);
    this.entrance.play();
    const names = this.names(this.focus());
    this.focusChange.emit(names);
    this.frame()?.announce(names.length ? names.join(' / ') : this.center().label);
  }

  private names(path: readonly number[]): string[] {
    const names: string[] = [];
    let items = this.roots();
    for (const index of path) {
      const item = items[index];
      if (!item) break;
      names.push(item.label);
      items = item.children ?? [];
    }
    return names;
  }

  private readGeometry(): void {
    const element = this.host.nativeElement;
    const next = {
      hole: readTokenNumber(element, '--tx-chart-sunburst-hole', DEFAULTS.hole),
      corner: this.isUnstyled() ? 0 : readTokenNumber(element, '--tx-chart-sunburst-corner-radius', DEFAULTS.corner),
      fontSize: readTokenNumber(element, '--tx-chart-sunburst-label-font-size', DEFAULTS.fontSize),
    };
    const current = this.geometry();
    if (current.hole !== next.hole || current.corner !== next.corner || current.fontSize !== next.fontSize) this.geometry.set(next);
  }
}
