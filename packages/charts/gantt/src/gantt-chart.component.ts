import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { dateFormat, toggleKey } from '@tectra-ng/charts/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, formatMessage, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxIcon } from '@tectra-ng/icons';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TX_GANTT_DAY, TX_GANTT_DAY_WIDTH, ganttDays, ganttRange, ganttRows, ganttTicks, ganttTime, ganttX } from './gantt-layout';
import { TxGanttDate, TxGanttGroupToggle, TxGanttLayout, TxGanttPart, TxGanttSpan, TxGanttTask, TxGanttTaskEvent, TxGanttZoom } from './gantt-chart.types';

const ZOOMS: readonly TxGanttZoom[] = ['quarter', 'month', 'week', 'day'];
const MIN_BAR = 6;
const SKELETON_ROWS = 5;
const TODAY_AT = 0.3;
const REVEAL_FROM = 0.8;

export type TxGanttBarLabels = 'auto' | 'outside' | 'inside' | 'none';

@Component({
  selector: 'tx-gantt-chart',
  imports: [TxButton, TxButtonGroup, TxTooltip, TxIcon, TxSkeleton],
  templateUrl: './gantt-chart.component.html',
  styleUrl: './gantt-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-gantt-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-zoom]': 'zoom()',
    '[attr.data-layout]': 'layout()',
    '[attr.aria-busy]': 'loading() || null',
  },
})
export class TxGanttChart {
  private locale = inject(TxLocaleService);
  private injector = inject(Injector);
  readonly translations = injectTranslations();

  readonly tasks = input<readonly TxGanttTask[] | null | undefined>([]);
  readonly layout = input<TxGanttLayout>('tasks');
  readonly zoom = model<TxGanttZoom>('week');
  readonly start = input<TxGanttDate | null | undefined>(undefined);
  readonly end = input<TxGanttDate | null | undefined>(undefined);
  readonly padding = input(3);
  readonly today = input<TxGanttDate | null | undefined>(undefined);
  readonly barLabels = input<TxGanttBarLabels>('auto');
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly maxHeight = input('');
  readonly labelHeader = input('');
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxGanttPart, TxGanttChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly taskClick = output<TxGanttTaskEvent>();
  readonly groupToggle = output<TxGanttGroupToggle>();

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('ganttChart', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-chart'), ...this.passThrough().root?.style }));

  readonly uid = uniqueId('tx-gantt');
  readonly zooms = ZOOMS;
  readonly collapsed = signal<ReadonlySet<string>>(new Set());
  readonly focused = signal<string | null>(null);
  private readonly now = Date.now();
  readonly skeletonRows = Array.from({ length: SKELETON_ROWS }, (_, index) => index);

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly list = computed(() => this.tasks() ?? []);
  readonly isEmpty = computed(() => !this.list().some((task) => ganttTime(task.start) !== null));
  readonly dayWidth = computed(() => TX_GANTT_DAY_WIDTH[this.zoom()]);
  readonly range = computed(() => ganttRange(this.list(), Math.max(0, this.padding()), this.start(), this.end()));
  readonly width = computed(() => Math.ceil(ganttX(this.range()[1], this.range()[0], this.dayWidth())));
  readonly ticks = computed(() => ganttTicks(this.range(), this.zoom(), this.intl()));
  readonly rows = computed(() => ganttRows(this.list(), this.layout(), this.collapsed(), this.range()[0], this.dayWidth(), MIN_BAR));
  readonly spans = computed(() => this.rows().flatMap((row) => row.spans));
  readonly labelsInside = computed(() => this.barLabels() === 'inside' || (this.barLabels() === 'auto' && this.layout() === 'timeline'));
  readonly labelsOutside = computed(() => this.barLabels() === 'outside' || (this.barLabels() === 'auto' && this.layout() === 'tasks'));
  readonly tabStop = computed(() => {
    const spans = this.spans();
    const focused = this.focused();
    return spans.some((span) => span.task.id === focused) ? focused : (spans[0]?.task.id ?? null);
  });

  readonly todayTime = computed(() => {
    const today = this.today();
    return today === null ? null : today === undefined ? this.now : ganttTime(today);
  });
  readonly todayX = computed(() => {
    const time = this.todayTime();
    const [from, to] = this.range();
    return time === null || time < from || time > to ? null : ganttX(time, from, this.dayWidth());
  });

  readonly zoomLabels = computed(() => {
    const t = this.translations();
    return { day: t.chartZoomDay, week: t.chartZoomWeek, month: t.chartZoomMonth, quarter: t.chartZoomQuarter } as Record<TxGanttZoom, string>;
  });

  readonly dayFormat = computed(() => dateFormat(this.intl(), { day: 'numeric', month: 'short', year: 'numeric' }));

  readonly text = computed(() => {
    const t = this.translations();
    const format = this.dayFormat();
    return new Map(
      this.spans().map((span) => {
        const lines = span.task.milestone
          ? [span.task.label, `${t.chartMilestone}: ${format.format(span.start)}`]
          : [
              span.task.label,
              `${format.format(span.start)} – ${format.format(span.end - 1)} · ${formatMessage(t.chartDays, { count: ganttDays(span.start, span.end) }, this.intl())}`,
              ...(span.task.progress !== null && span.task.progress !== undefined ? [`${t.chartProgress}: ${Math.round(span.task.progress)}%`] : []),
            ];
        return [span.task.id, lines] as const;
      }),
    );
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const [from, to] = this.range();
    const format = this.dayFormat();
    const text = `${t.chartGantt}, ${formatMessage(t.chartSummaryTasks, { count: this.spans().length }, this.intl())}, ${format.format(from)} – ${format.format(to - TX_GANTT_DAY)}`;
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  constructor() {
    afterNextRender(() => this.revealToday());
  }

  tooltipFor(span: TxGanttSpan): string {
    return (this.text().get(span.task.id) ?? [span.task.label]).join('\n');
  }

  ariaFor(span: TxGanttSpan): string {
    return (this.text().get(span.task.id) ?? [span.task.label]).join(', ');
  }

  progressOf(span: TxGanttSpan): number | null {
    const progress = span.task.progress;
    return progress === null || progress === undefined || !Number.isFinite(progress) ? null : Math.max(0, Math.min(100, progress));
  }

  setZoom(zoom: TxGanttZoom, anchor?: { time: number; offset: number }): void {
    if (zoom === this.zoom()) return;
    const element = this.scroller()?.nativeElement;
    const keep = anchor ?? (element ? this.centerAnchor(element) : undefined);
    this.zoom.set(zoom);
    if (!keep || !element) return;
    afterNextRender(
      () => {
        element.scrollLeft = Math.max(0, this.labelWidth(element) + ganttX(keep.time, this.range()[0], this.dayWidth()) - keep.offset);
      },
      { injector: this.injector },
    );
  }

  stepZoom(step: number, anchor?: { time: number; offset: number }): void {
    const index = Math.max(0, Math.min(ZOOMS.length - 1, ZOOMS.indexOf(this.zoom()) + step));
    this.setZoom(ZOOMS[index], anchor);
  }

  onWheel(event: WheelEvent): void {
    if (!(event.ctrlKey || event.metaKey) || !event.deltaY) return;
    event.preventDefault();
    const element = this.scroller()?.nativeElement;
    if (!element) return;
    const offset = event.clientX - element.getBoundingClientRect().left;
    const x = element.scrollLeft + offset - this.labelWidth(element);
    this.stepZoom(event.deltaY < 0 ? 1 : -1, { time: this.range()[0] + (x / this.dayWidth()) * TX_GANTT_DAY, offset });
  }

  scrollToToday(): void {
    const element = this.scroller()?.nativeElement;
    const x = this.todayX();
    if (!element || x === null) return;
    const view = element.clientWidth - this.labelWidth(element);
    element.scrollTo({ left: Math.max(0, x - view * TODAY_AT), behavior: this.reducedMotion() ? 'auto' : 'smooth' });
  }

  onToggle(group: string): void {
    this.collapsed.update((groups) => toggleKey(groups, group));
    this.groupToggle.emit({ group, collapsed: this.collapsed().has(group) });
  }

  onBarClick(span: TxGanttSpan): void {
    this.focused.set(span.task.id);
    this.taskClick.emit({ task: span.task, start: new Date(span.start), end: new Date(span.end) });
  }

  onBarFocus(span: TxGanttSpan, element: HTMLElement): void {
    this.focused.set(span.task.id);
    this.reveal(element);
  }

  onBarKeydown(event: KeyboardEvent, span: TxGanttSpan): void {
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      this.stepZoom(1);
      return;
    }
    if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      this.stepZoom(-1);
      return;
    }
    const spans = this.spans();
    const index = spans.indexOf(span);
    const row = this.rows().find((item) => item.spans.includes(span));
    let next = -1;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const rows = this.rows().filter((item) => item.spans.length);
      const at = rows.indexOf(row as (typeof rows)[number]) + (event.key === 'ArrowDown' ? 1 : -1);
      const target = rows[Math.max(0, Math.min(rows.length - 1, at))];
      next = target ? spans.indexOf(target.spans.reduce((best, item) => (Math.abs(item.x - span.x) < Math.abs(best.x - span.x) ? item : best))) : -1;
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      next = Math.max(0, Math.min(spans.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)));
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = spans.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    const target = spans[next];
    if (!target) return;
    this.focused.set(target.task.id);
    afterNextRender(() => this.scroller()?.nativeElement.querySelector<HTMLElement>(`[data-task="${CSS.escape(target.task.id)}"]`)?.focus(), { injector: this.injector });
  }

  private reveal(element: HTMLElement): void {
    const scroller = this.scroller()?.nativeElement;
    if (!scroller) return;
    const box = scroller.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    const left = box.left + this.labelWidth(scroller);
    const behavior: ScrollBehavior = this.reducedMotion() ? 'auto' : 'smooth';
    if (rect.left < left) scroller.scrollBy({ left: rect.left - left - 16, behavior });
    else if (rect.right > box.right) scroller.scrollBy({ left: Math.min(rect.right - box.right + 16, rect.left - left - 16), behavior });
  }

  private revealToday(): void {
    const element = this.scroller()?.nativeElement;
    const x = this.todayX();
    if (!element || x === null) return;
    const view = element.clientWidth - this.labelWidth(element);
    if (x > view * REVEAL_FROM) element.scrollLeft = Math.max(0, x - view * TODAY_AT);
  }

  private centerAnchor(element: HTMLElement): { time: number; offset: number } {
    const label = this.labelWidth(element);
    const offset = label + (element.clientWidth - label) / 2;
    return { time: this.range()[0] + ((element.scrollLeft + offset - label) / this.dayWidth()) * TX_GANTT_DAY, offset };
  }

  private labelWidth(element: HTMLElement): number {
    return element.querySelector<HTMLElement>('.tx-gantt-chart__corner')?.offsetWidth ?? 0;
  }

  private reducedMotion(): boolean {
    return this.scroller()?.nativeElement.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

}
