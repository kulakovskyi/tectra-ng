import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, contentChild, inject, input, linkedSignal, numberAttribute, output } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraMonthCalendarTokens, toStyleObject } from '@tectra-ng/themes';
import { TxAvatar } from '@tectra-ng/ui/avatar';
import { TxPill } from '@tectra-ng/ui/pill';
import { buildMonthLayout, monthWeekdays } from './month-calendar.layout';
import { TxMonthCalendarEventTemplate } from './month-calendar.templates';
import {
  TxMonthCalendarDateInput,
  TxMonthCalendarDay,
  TxMonthCalendarEvent,
  TxMonthCalendarLabels,
  TxMonthCalendarMarker,
  TxMonthCalendarPart,
  TxMonthCalendarWeek,
} from './month-calendar.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { MONTH_CALENDAR_ICON_DEFAULTS } from './month-calendar.icons';
import { MONTH_CALENDAR_THEME } from './month-calendar.theme';

const KEY_STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

@Component({
  selector: 'tx-month-calendar',
  imports: [NgTemplateOutlet, TxAvatar, TxPill],
  templateUrl: './month-calendar.component.html',
  styleUrl: './month-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-month-calendar',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
  viewProviders: [provideTxIconDefaults(MONTH_CALENDAR_ICON_DEFAULTS)],
})
export class TxMonthCalendar {
  private readonly monthCalendarTheme = injectTokens(MONTH_CALENDAR_THEME);

  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private localeService = inject(TxLocaleService);
  private readonly createdAt = new Date();

  readonly month = input<Date | undefined>(undefined);
  readonly events = input<readonly TxMonthCalendarEvent[]>([]);
  readonly markers = input<readonly TxMonthCalendarMarker[]>([]);
  readonly selectedDate = input<TxMonthCalendarDateInput | null>(null);
  readonly weekStartsOn = input<number | undefined>(undefined);
  readonly maxLanes = input<number, unknown>(3, { transform: numberAttribute });
  readonly labels = input<Partial<TxMonthCalendarLabels>>({});
  readonly locale = input<string | undefined>(undefined);
  readonly today = input<Date | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraMonthCalendarTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxMonthCalendarPart, TxMonthCalendar> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly dayClick = output<Date>();
  readonly eventClick = output<TxMonthCalendarEvent>();

  protected readonly eventTemplate = contentChild(TxMonthCalendarEventTemplate);

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('monthCalendar', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-month-calendar'), ...this.passThrough().root?.style }));

  readonly resolvedLocale = computed(() => this.locale() ?? this.localeService.locale().intl);
  readonly resolvedWeekStart = computed(() => this.weekStartsOn() ?? this.localeService.locale().firstDayOfWeek);
  readonly text = computed<TxMonthCalendarLabels>(() => {
    const translations = this.translations();
    return { more: translations.moreEvents, today: translations.today, region: translations.calendar, ...this.labels() };
  });
  readonly weekdays = computed(() => monthWeekdays(this.resolvedWeekStart(), this.resolvedLocale()));
  readonly weeks = computed<TxMonthCalendarWeek[]>(() =>
    buildMonthLayout({
      month: this.month() ?? this.createdAt,
      events: this.events(),
      markers: this.markers(),
      selectedDate: this.selectedDate(),
      today: this.today() ?? this.createdAt,
      weekStartsOn: this.resolvedWeekStart(),
      maxLanes: this.maxLanes(),
    }),
  );
  private readonly days = computed(() => this.weeks().flatMap((week) => week.days));
  readonly focusKey = linkedSignal<string>(() => {
    const days = this.days();
    const target = days.find((day) => day.selected) ?? days.find((day) => day.today && day.inMonth) ?? days.find((day) => day.inMonth);
    return target?.key ?? '';
  });
  private readonly dateFormat = computed(() => new Intl.DateTimeFormat(this.resolvedLocale(), { dateStyle: 'full' }));

  dayLabel(day: TxMonthCalendarDay): string {
    const events = day.events.length ? this.translations().events.replace('{count}', String(day.events.length)) : '';
    return [this.dateFormat().format(day.date), day.today ? this.text().today : '', ...day.markers.map((marker) => marker.label), events, ...day.events.map((event) => event.title)]
      .filter(Boolean)
      .join(', ');
  }

  moreLabel(count: number): string {
    return this.text().more.replace(/\{count\}/g, String(count));
  }

  onDayClick(day: TxMonthCalendarDay): void {
    this.focusKey.set(day.key);
    this.dayClick.emit(day.date);
  }

  onEventClick(event: TxMonthCalendarEvent): void {
    this.eventClick.emit(event);
  }

  onDayKeydown(event: KeyboardEvent, day: TxMonthCalendarDay): void {
    const step = KEY_STEPS[event.key];
    if (!step) return;
    event.preventDefault();
    const target = this.days().find((item) => item.index === day.index + step);
    if (!target) return;
    this.focusKey.set(target.key);
    this.host.nativeElement.querySelector<HTMLElement>(`[data-day-key="${target.key}"]`)?.focus();
  }
}
