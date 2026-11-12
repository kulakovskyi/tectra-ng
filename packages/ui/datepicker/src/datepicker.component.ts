import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedOverlayPositionChange, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxAnnouncer, uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectFluid } from '@tectra-ng/core/fluid';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { TxOverlayAnchor, TxOverlayInsets, TxPlacement, placementFromPosition, txAnimateEnter, txAnimateLeave, txPositions, txScrollStrategy, watchOrigin } from '@tectra-ng/core/overlay';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDatePickerTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxCalendarDay, addDays, addMonths, buildMonth, compareDays, isMonthSelectable, isSelectable, isYearSelectable, sameDay, startOfDay, weekdayOrder } from './calendar';
import { TxTimeFormat, dateNames, formatDate, formatTime, parseDate, parseTime } from './date-format';
import {
  TxDatePickerButtonBar,
  TxDatePickerDate,
  TxDatePickerDecade,
  TxDatePickerFooter,
  TxDatePickerHeader,
  TxDatePickerInputIcon,
  TxDatePickerTriggerIcon,
} from './datepicker.templates';
import {
  TxDatePickerDataType,
  TxDatePickerHourFormat,
  TxDatePickerIconDisplay,
  TxDatePickerMonthChangeEvent,
  TxDatePickerPart,
  TxDatePickerResponsiveOption,
  TxDatePickerSelectionMode,
  TxDatePickerSize,
  TxDatePickerValue,
  TxDatePickerVariant,
  TxDatePickerView,
} from './datepicker.types';
import { DATEPICKER_ICON_DEFAULTS } from './datepicker.icons';

type TimeUnit = 'hour' | 'minute' | 'second';

const REPEAT_DELAY = 400;
const REPEAT_INTERVAL = 80;

function isoDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'tx-datepicker',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, CdkTrapFocus, TxOverlayAnchor, NgTemplateOutlet, TxIcon, TxInput, TxButton],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxDatePicker), multi: true }],
  host: {
    class: 'tx-datepicker',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
    '[class.tx-datepicker--inline]': 'inline()',
    '[class.tx-datepicker--open]': 'isOpen()',
    '[class.tx-datepicker--filled]': 'isFilled()',
    '[class.tx-datepicker--invalid]': 'isInvalid()',
    '[class.tx-datepicker--disabled]': 'isDisabled()',
    '[class.tx-datepicker--fluid]': 'isFluid()',
    '[class.tx-datepicker--button]': 'showIcon() && iconDisplay() === "button" && !inline()',
  },
  viewProviders: [provideTxIconDefaults(DATEPICKER_ICON_DEFAULTS)],
})
export class TxDatePicker extends TxFormControlBase<TxDatePickerValue> {
  readonly selectionMode = input<TxDatePickerSelectionMode>('single');
  readonly dateFormat = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly iconAriaLabel = input<string | undefined>(undefined);
  readonly inline = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showIcon = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly iconDisplay = input<TxDatePickerIconDisplay>('button');
  readonly icon = input<TxIconName | (string & {})>('calendar');
  readonly showClear = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showButtonBar = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showOtherMonths = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly selectOtherMonths = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showWeek = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly startWeekFromFirstDayOfYear = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showTime = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly timeOnly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly hourFormat = input<TxDatePickerHourFormat>('24');
  readonly showSeconds = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly stepHour = input<number, unknown>(1, { transform: numberAttribute });
  readonly stepMinute = input<number, unknown>(1, { transform: numberAttribute });
  readonly stepSecond = input<number, unknown>(1, { transform: numberAttribute });
  readonly timeSeparator = input<string>(':');
  readonly view = input<TxDatePickerView>('date');
  readonly numberOfMonths = input<number, unknown>(1, { transform: numberAttribute });
  readonly responsiveOptions = input<readonly TxDatePickerResponsiveOption[] | undefined>(undefined);
  readonly firstDayOfWeek = input<number | undefined>(undefined);
  readonly minDate = input<Date | null | undefined>(undefined);
  readonly maxDate = input<Date | null | undefined>(undefined);
  readonly disabledDates = input<readonly Date[] | null | undefined>(undefined);
  readonly disabledDays = input<readonly number[] | null | undefined>(undefined);
  readonly maxDateCount = input<number | undefined>(undefined);
  readonly defaultDate = input<Date | null | undefined>(undefined);
  readonly readonlyInput = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly keepInvalid = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly hideOnDateTimeSelect = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showOnFocus = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly touchUI = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dataType = input<TxDatePickerDataType>('date');
  readonly multipleSeparator = input<string>(',');
  readonly rangeSeparator = input<string>('-');
  readonly shortYearCutoff = input<string | number>('+10');
  readonly size = input<TxDatePickerSize>('medium');
  readonly variant = input<TxDatePickerVariant>('outlined');
  readonly fluid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraDatePickerTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxDatePickerPart, TxDatePicker> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly selected = output<Date>();
  readonly cleared = output<void>();
  readonly todayClicked = output<Date>();
  readonly clearClicked = output<void>();
  readonly monthChange = output<TxDatePickerMonthChangeEvent>();
  readonly yearChange = output<TxDatePickerMonthChangeEvent>();
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();
  readonly typed = output<string>();

  protected readonly dateTemplate = contentChild(TxDatePickerDate);
  protected readonly headerTemplate = contentChild(TxDatePickerHeader);
  protected readonly footerTemplate = contentChild(TxDatePickerFooter);
  protected readonly decadeTemplate = contentChild(TxDatePickerDecade);
  protected readonly buttonBarTemplate = contentChild(TxDatePickerButtonBar);
  protected readonly triggerIconTemplate = contentChild(TxDatePickerTriggerIcon);
  protected readonly inputIconTemplate = contentChild(TxDatePickerInputIcon);

  readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');
  readonly fieldRef = viewChild<ElementRef<HTMLElement>>('field');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTemplate');
  private readonly connectedOverlay = viewChild(CdkConnectedOverlay);

  private document = inject(DOCUMENT);
  private injector = inject(Injector);
  private overlay = inject(Overlay);
  private viewContainer = inject(ViewContainerRef);
  private overlayInsets = inject(TxOverlayInsets);
  private announcer = inject(TxAnnouncer);
  private localeService = inject(TxLocaleService);
  private touchRef: OverlayRef | null = null;
  private repeatTimer: ReturnType<typeof setTimeout> | null = null;
  private hasEntered = false;
  private focusPanelOnOpen = false;
  private restoringFocus = false;

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly isFluid = injectFluid(this.fluid);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly passThrough = injectPassThrough('datePicker', this, this.pt, this.ptOptions);
  readonly positions = txPositions('bottom-start', 4);
  readonly scrollStrategy = txScrollStrategy(this.injector);
  readonly panelId = uniqueId('tx-datepicker');
  readonly generatedInputId = `${this.panelId}-input`;

  readonly isOpen = signal(false);
  readonly isPanelMounted = signal(false);
  readonly placement = signal<TxPlacement>('bottom-start');
  readonly draft = signal<string | null>(null);
  readonly viewMonth = signal(new Date().getMonth());
  readonly viewYear = signal(new Date().getFullYear());
  readonly currentView = signal<TxDatePickerView>('date');
  readonly focusedDate = signal<Date>(startOfDay(new Date()));
  readonly focusedMonth = signal(0);
  readonly focusedYear = signal(new Date().getFullYear());
  readonly pendingTime = signal<Date | null>(null);
  readonly previewDate = signal<Date | null>(null);
  readonly panelMinWidth = signal(0);
  private readonly matchedMonths = signal<number | null>(null);

  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly isEditable = computed(() => !this.isDisabled() && !this.readonly());
  readonly resolvedInputId = computed(() => this.inputId() ?? this.generatedInputId);
  readonly hasTime = computed(() => this.showTime() || this.timeOnly());
  readonly locale = computed(() => this.localeService.locale().intl);
  readonly names = computed(() => dateNames(this.locale()));
  readonly resolvedFormat = computed(() => this.dateFormat() ?? this.localeService.locale().dateFormat ?? 'mm/dd/yy');
  readonly resolvedFirstDay = computed(() => this.firstDayOfWeek() ?? this.localeService.locale().firstDayOfWeek);
  readonly timeFormat = computed<TxTimeFormat>(() => ({
    hourFormat: this.hourFormat(),
    showSeconds: this.showSeconds(),
    separator: this.timeSeparator(),
    am: this.translations().am,
    pm: this.translations().pm,
  }));
  readonly rules = computed(() => ({ minDate: this.minDate(), maxDate: this.maxDate(), disabledDates: this.disabledDates(), disabledDays: this.disabledDays() }));
  readonly dates = computed<(Date | null)[]>(() => this.normalize(this.value()));
  readonly inputText = computed(() => this.draft() ?? this.formatValue(this.dates()));
  readonly isFilled = computed(() => !!this.inputText());
  readonly canClear = computed(() => this.showClear() && this.isEditable() && this.dates().some(Boolean) && !this.inline());
  readonly monthCount = computed(() => (this.timeOnly() ? 1 : (this.matchedMonths() ?? Math.max(1, this.numberOfMonths()))));
  readonly weekdays = computed(() => {
    const names = this.names();
    return weekdayOrder(this.resolvedFirstDay()).map((day) => ({ short: names.dayNamesShort[day].slice(0, 2), long: names.dayNames[day] }));
  });
  readonly today = computed(() => startOfDay(new Date()));
  readonly months = computed(() =>
    Array.from({ length: this.monthCount() }, (_, index) => {
      const first = new Date(this.viewYear(), this.viewMonth() + index, 1);
      return buildMonth(first.getFullYear(), first.getMonth(), this.resolvedFirstDay(), this.rules(), this.today(), this.startWeekFromFirstDayOfYear());
    }),
  );
  readonly decade = computed(() => {
    const start = this.viewYear() - (this.viewYear() % 10);
    return Array.from({ length: 10 }, (_, index) => start + index);
  });
  readonly timeSource = computed(() => this.pendingTime() ?? this.lastDate() ?? this.defaultDate() ?? null);
  readonly hours = computed(() => {
    const hours = this.timeSource()?.getHours() ?? 0;
    return this.hourFormat() === '12' ? hours % 12 || 12 : hours;
  });
  readonly minutes = computed(() => this.timeSource()?.getMinutes() ?? 0);
  readonly seconds = computed(() => this.timeSource()?.getSeconds() ?? 0);
  readonly isPm = computed(() => (this.timeSource()?.getHours() ?? 0) >= 12);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-date-picker'), ...this.passThrough().root?.style }));
  readonly panelStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-date-picker'), ...this.passThrough().panel?.style }));
  readonly showPanel = computed(() => this.inline() || this.isPanelMounted());

  private readonly syncView = effect(() => this.currentView.set(this.view()));

  private readonly syncDefault = effect(() => {
    const base = this.defaultDate();
    if (base && !untracked(() => this.dates().length)) this.showMonthOf(base);
  });

  private readonly followOrigin = effect((onCleanup) => {
    const field = this.fieldRef()?.nativeElement;
    if (!this.isOpen() || this.touchUI() || !field) return;
    onCleanup(
      watchOrigin(field, this.overlayInsets, {
        insetsChange: () => this.connectedOverlay()?.overlayRef?.updatePosition(),
        containerScroll: () => this.close(false),
      }),
    );
  });

  private readonly responsive = effect((onCleanup) => {
    const options = [...(this.responsiveOptions() ?? [])].sort((a, b) => parseFloat(b.breakpoint) - parseFloat(a.breakpoint));
    const view = this.document.defaultView;
    if (!options.length || !view?.matchMedia) {
      this.matchedMonths.set(null);
      return;
    }
    const queries = options.map((option) => ({ option, query: view.matchMedia(`(max-width: ${option.breakpoint})`) }));
    const update = () => this.matchedMonths.set([...queries].reverse().find(({ query }) => query.matches)?.option.numberOfMonths ?? null);
    update();
    queries.forEach(({ query }) => query.addEventListener?.('change', update));
    onCleanup(() => queries.forEach(({ query }) => query.removeEventListener?.('change', update)));
  });

  private readonly cleanup = inject(DestroyRef).onDestroy(() => {
    this.stopRepeat();
    this.touchRef?.dispose();
  });

  override writeValue(value: TxDatePickerValue): void {
    super.writeValue(value);
    this.draft.set(null);
    this.pendingTime.set(null);
    const first = this.dates().find((date): date is Date => !!date) ?? this.defaultDate();
    if (first) this.showMonthOf(first);
  }

  private showMonthOf(date: Date): void {
    this.viewMonth.set(date.getMonth());
    this.viewYear.set(date.getFullYear());
    this.focusedDate.set(startOfDay(date));
  }

  open(focusPanel = false): void {
    if (this.inline() || this.isOpen() || !this.isEditable()) return;
    this.focusPanelOnOpen = focusPanel;
    this.resetFocus();
    this.isOpen.set(true);
    this.hasEntered = false;
    this.panelMinWidth.set(this.fieldRef()?.nativeElement.offsetWidth ?? 0);
    if (this.touchUI()) this.openTouch();
    else this.isPanelMounted.set(true);
    this.opened.emit();
  }

  close(focusInput = true): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.previewDate.set(null);
    this.stopRepeat();
    this.markTouched();
    this.closed.emit();
    if (this.draft() !== null) this.commitDraft();
    if (focusInput) this.focusInput();
    const panel = this.panelRef()?.nativeElement;
    (panel ? txAnimateLeave(panel, this.placement()) : Promise.resolve()).then(() => {
      if (this.isOpen()) return;
      this.isPanelMounted.set(false);
      this.touchRef?.detach();
      this.touchRef?.dispose();
      this.touchRef = null;
    });
  }

  toggle(focusPanel = true): void {
    if (this.isOpen()) this.close();
    else this.open(focusPanel);
  }

  onAttach(): void {
    if (this.focusPanelOnOpen) this.focusActive();
  }

  onPositionChange(change: ConnectedOverlayPositionChange): void {
    this.placement.set(placementFromPosition(change.connectionPair) ?? 'bottom-start');
    const panel = this.panelRef()?.nativeElement;
    if (!this.hasEntered && panel) {
      this.hasEntered = true;
      txAnimateEnter(panel, this.placement());
    }
  }

  onOutsideClick(event: MouseEvent): void {
    if (!this.fieldRef()?.nativeElement.contains(event.target as Node)) this.close(false);
  }

  onInputFocus(event: FocusEvent): void {
    this.focused.emit(event);
    if (this.showOnFocus() && !this.isOpen() && !this.restoringFocus) this.open(false);
  }

  private focusInput(): void {
    this.restoringFocus = true;
    this.inputRef()?.nativeElement.focus();
    this.restoringFocus = false;
  }

  onInputClick(): void {
    if (this.showOnFocus() && !this.isOpen()) this.open(false);
  }

  onInputBlur(event: FocusEvent): void {
    this.blurred.emit(event);
    const next = event.relatedTarget as Node | null;
    const insidePanel = !!next && !!this.panelRef()?.nativeElement.contains(next);
    if (!insidePanel) {
      this.commitDraft();
      if (this.isOpen() && !this.touchUI() && !this.fieldRef()?.nativeElement.contains(next)) this.close(false);
      this.markTouched();
    }
  }

  onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.draft.set(text);
    this.typed.emit(text);
    if (!text.trim()) {
      this.setDates([], false);
      return;
    }
    const parsed = this.parseValue(text);
    if (parsed) {
      this.setDates(parsed, false);
      const first = parsed.find((date): date is Date => !!date);
      if (first) {
        this.viewMonth.set(first.getMonth());
        this.viewYear.set(first.getFullYear());
      }
    }
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && (event.altKey || !this.isOpen())) {
      event.preventDefault();
      if (this.isOpen()) this.focusActive();
      else this.open(true);
    } else if (event.key === 'ArrowDown' && this.isOpen()) {
      event.preventDefault();
      this.focusActive();
    } else if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
    } else if (event.key === 'Enter') {
      this.commitDraft();
      if (this.isOpen()) this.close();
    } else if (event.key === 'Tab' && this.isOpen() && !this.touchUI()) {
      this.commitDraft();
      this.close(false);
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.inline()) {
      event.preventDefault();
      event.stopPropagation();
      this.close();
    }
  }

  onPanelFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (this.isOpen() && !this.touchUI() && next && !this.panelRef()?.nativeElement.contains(next) && !this.fieldRef()?.nativeElement.contains(next)) this.close(false);
  }

  previous(): void {
    this.step(-1);
  }

  next(): void {
    this.step(1);
  }

  showMonthView(): void {
    this.focusedMonth.set(this.viewMonth());
    this.currentView.set('month');
    this.focusActive();
  }

  showYearView(): void {
    this.focusedYear.set(this.viewYear());
    this.currentView.set('year');
    this.focusActive();
  }

  pickMonth(month: number): void {
    if (!isMonthSelectable(this.viewYear(), month, this.rules())) return;
    if (this.view() === 'month') {
      this.selectDay(new Date(this.viewYear(), month, 1));
      return;
    }
    this.viewMonth.set(month);
    this.currentView.set('date');
    this.monthChange.emit({ month: month + 1, year: this.viewYear() });
    this.focusedDate.set(this.clampToMonth(this.focusedDate(), this.viewYear(), month));
    this.focusActive();
  }

  pickYear(year: number): void {
    if (!isYearSelectable(year, this.rules())) return;
    if (this.view() === 'year') {
      this.selectDay(new Date(year, 0, 1));
      return;
    }
    this.viewYear.set(year);
    this.yearChange.emit({ month: this.viewMonth() + 1, year });
    this.focusedMonth.set(this.viewMonth());
    this.currentView.set('month');
    this.focusActive();
  }

  onDayClick(day: TxCalendarDay): void {
    if (!day.selectable || (day.otherMonth && !this.selectOtherMonths()) || !this.isEditable()) return;
    this.focusedDate.set(day.date);
    this.selectDay(day.date);
  }

  onDayKeydown(event: KeyboardEvent, day: TxCalendarDay): void {
    const date = day.date;
    const firstDay = this.resolvedFirstDay();
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(date, -1),
      ArrowRight: () => addDays(date, 1),
      ArrowUp: () => addDays(date, -7),
      ArrowDown: () => addDays(date, 7),
      Home: () => addDays(date, -((date.getDay() - firstDay + 7) % 7)),
      End: () => addDays(date, 6 - ((date.getDay() - firstDay + 7) % 7)),
      PageUp: () => addMonths(date, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(date, event.shiftKey ? 12 : 1),
    };
    if (moves[event.key]) {
      event.preventDefault();
      this.moveFocus(moves[event.key]());
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onDayClick(day);
    }
  }

  onMonthKeydown(event: KeyboardEvent, month: number): void {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
    if (moves[event.key] !== undefined) {
      event.preventDefault();
      const next = month + moves[event.key];
      if (next < 0 || next > 11) {
        this.viewYear.update((year) => year + (next < 0 ? -1 : 1));
        this.focusedMonth.set((next + 12) % 12);
      } else this.focusedMonth.set(next);
      this.focusActive();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.pickMonth(month);
    }
  }

  onYearKeydown(event: KeyboardEvent, year: number): void {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -2, ArrowDown: 2 };
    if (moves[event.key] !== undefined) {
      event.preventDefault();
      const next = year + moves[event.key];
      this.focusedYear.set(next);
      if (next < this.decade()[0] || next > this.decade()[9]) this.viewYear.set(next);
      this.focusActive();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.pickYear(year);
    }
  }

  isSelected(date: Date): boolean {
    const [start, end] = this.dates();
    if (this.selectionMode() === 'range' && start && end) return sameDay(date, start) || sameDay(date, end);
    return this.dates().some((value) => sameDay(value, date));
  }

  isInRange(date: Date): boolean {
    if (this.selectionMode() !== 'range') return false;
    const [start, end] = this.dates();
    return !!start && !!end && compareDays(date, start) > 0 && compareDays(date, end) < 0;
  }

  isPreview(date: Date): boolean {
    const preview = this.previewDate();
    if (this.selectionMode() !== 'range' || !preview) return false;
    const [start, end] = this.dates();
    if (!start || end || compareDays(preview, start) <= 0) return false;
    return compareDays(date, start) > 0 && compareDays(date, preview) <= 0;
  }

  onDayEnter(day: TxCalendarDay): void {
    if (this.selectionMode() === 'range') this.previewDate.set(day.selectable ? day.date : null);
  }

  onGridLeave(): void {
    this.previewDate.set(null);
  }

  isMonthSelected(month: number): boolean {
    return this.dates().some((date) => !!date && date.getMonth() === month && date.getFullYear() === this.viewYear());
  }

  isYearSelected(year: number): boolean {
    return this.dates().some((date) => !!date && date.getFullYear() === year);
  }

  monthSelectable(month: number): boolean {
    return isMonthSelectable(this.viewYear(), month, this.rules());
  }

  yearSelectable(year: number): boolean {
    return isYearSelectable(year, this.rules());
  }

  dayKey(date: Date): string {
    return isoDay(date);
  }

  dayLabel(date: Date): string {
    return new Intl.DateTimeFormat(this.locale(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  }

  isFocusedDay(day: TxCalendarDay): boolean {
    return sameDay(day.date, this.focusedDate()) && !day.otherMonth;
  }

  selectToday(): void {
    const today = new Date();
    const time = this.timeSource();
    if (time && this.hasTime()) today.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
    else today.setHours(0, 0, 0, 0);
    this.viewMonth.set(today.getMonth());
    this.viewYear.set(today.getFullYear());
    this.focusedDate.set(startOfDay(today));
    this.currentView.set('date');
    if (isSelectable(today, this.rules())) this.selectDay(today, true);
    this.todayClicked.emit(today);
  }

  clear(): void {
    this.setDates([], true);
    this.pendingTime.set(null);
    this.cleared.emit();
  }

  onClearButton(): void {
    this.clear();
    this.clearClicked.emit();
    if (!this.inline()) this.close();
  }

  onClearIcon(): void {
    this.clear();
    this.focusInput();
  }

  startRepeat(event: PointerEvent, unit: TimeUnit, direction: 1 | -1): void {
    if (event.button !== 0) return;
    event.preventDefault();
    this.stopRepeat();
    this.shiftTime(unit, direction);
    const repeat = (delay: number) => {
      this.repeatTimer = setTimeout(() => {
        this.shiftTime(unit, direction);
        repeat(REPEAT_INTERVAL);
      }, delay);
    };
    repeat(REPEAT_DELAY);
  }

  stopRepeat(): void {
    if (this.repeatTimer) clearTimeout(this.repeatTimer);
    this.repeatTimer = null;
  }

  onTimeKeydown(event: KeyboardEvent, unit: TimeUnit, direction: 1 | -1): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.shiftTime(unit, direction);
    }
  }

  toggleMeridiem(): void {
    const base = this.timeBase();
    base.setHours((base.getHours() + 12) % 24);
    this.applyTime(base);
  }

  formatPart(value: number): string {
    return String(value).padStart(2, '0');
  }

  shiftTime(unit: TimeUnit, direction: 1 | -1): void {
    if (!this.isEditable()) return;
    const base = this.timeBase();
    if (unit === 'hour') base.setHours(base.getHours() + direction * this.stepHour());
    if (unit === 'minute') base.setMinutes(base.getMinutes() + direction * this.stepMinute());
    if (unit === 'second') base.setSeconds(base.getSeconds() + direction * this.stepSecond());
    const source = this.timeSource();
    if (source && !this.timeOnly()) base.setFullYear(source.getFullYear(), source.getMonth(), source.getDate());
    this.applyTime(base);
  }

  private timeBase(): Date {
    const source = this.timeSource();
    return source ? new Date(source) : new Date(new Date().setHours(0, 0, 0, 0));
  }

  private applyTime(time: Date): void {
    const dates = this.dates();
    if (this.timeOnly()) {
      this.setDates([time], true);
      return;
    }
    const lastIndex = dates.map((date, index) => (date ? index : -1)).filter((index) => index >= 0).pop();
    if (lastIndex === undefined) {
      this.pendingTime.set(time);
      return;
    }
    const next = [...dates];
    const target = new Date(next[lastIndex] as Date);
    target.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
    next[lastIndex] = target;
    this.setDates(next, true);
  }

  private lastDate(): Date | null {
    return [...this.dates()].reverse().find((date): date is Date => !!date) ?? null;
  }

  private selectDay(day: Date, fromToday = false): void {
    const date = new Date(day);
    const time = this.timeSource();
    if (this.hasTime() && time) date.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
    else if (!fromToday) date.setHours(0, 0, 0, 0);
    const current = this.dates();
    let next: (Date | null)[];
    switch (this.selectionMode()) {
      case 'multiple': {
        const exists = current.some((value) => sameDay(value, date));
        if (exists) next = current.filter((value) => !sameDay(value, date));
        else if (this.maxDateCount() && current.length >= (this.maxDateCount() as number)) return;
        else next = [...current.filter(Boolean), date];
        break;
      }
      case 'range': {
        const [start, end] = current;
        next = !start || end || compareDays(date, start) < 0 ? [date, null] : [start, date];
        break;
      }
      default:
        next = [date];
    }
    this.pendingTime.set(null);
    this.previewDate.set(null);
    this.setDates(next, true);
    this.selected.emit(date);
    void this.announcer.announce(this.translations().dateSelected.replace('{date}', this.formatValue(next)));
    const done = this.selectionMode() === 'single' || (this.selectionMode() === 'range' && !!next[1]);
    if (done && this.hideOnDateTimeSelect() && !this.hasTime() && !this.inline()) this.close();
  }

  private setDates(dates: (Date | null)[], resetDraft: boolean): void {
    if (resetDraft) this.draft.set(null);
    this.updateValue(this.toValue(dates));
  }

  private commitDraft(): void {
    const text = this.draft();
    if (text === null) return;
    if (!text.trim()) {
      this.draft.set(null);
      this.setDates([], true);
      return;
    }
    const parsed = this.parseValue(text);
    if (parsed) this.setDates(parsed, true);
    else if (!this.keepInvalid()) this.draft.set(null);
  }

  private step(direction: 1 | -1): void {
    const view = this.currentView();
    if (view === 'year') {
      this.viewYear.update((year) => year + direction * 10);
      return;
    }
    if (view === 'month') {
      this.viewYear.update((year) => year + direction);
      this.yearChange.emit({ month: this.viewMonth() + 1, year: this.viewYear() });
      return;
    }
    const next = new Date(this.viewYear(), this.viewMonth() + direction, 1);
    const yearChanged = next.getFullYear() !== this.viewYear();
    this.viewMonth.set(next.getMonth());
    this.viewYear.set(next.getFullYear());
    this.monthChange.emit({ month: next.getMonth() + 1, year: next.getFullYear() });
    if (yearChanged) this.yearChange.emit({ month: next.getMonth() + 1, year: next.getFullYear() });
    this.focusedDate.set(this.clampToMonth(this.focusedDate(), next.getFullYear(), next.getMonth()));
  }

  private clampToMonth(date: Date, year: number, month: number): Date {
    return new Date(year, month, Math.min(date.getDate(), new Date(year, month + 1, 0).getDate()));
  }

  private moveFocus(date: Date): void {
    const first = new Date(this.viewYear(), this.viewMonth(), 1);
    const last = new Date(this.viewYear(), this.viewMonth() + this.monthCount(), 0);
    if (compareDays(date, first) < 0 || compareDays(date, last) > 0) {
      const shift = compareDays(date, first) < 0 ? -1 : 1;
      const target = shift < 0 ? new Date(date.getFullYear(), date.getMonth(), 1) : new Date(date.getFullYear(), date.getMonth() - this.monthCount() + 1, 1);
      this.viewMonth.set(target.getMonth());
      this.viewYear.set(target.getFullYear());
      this.monthChange.emit({ month: target.getMonth() + 1, year: target.getFullYear() });
    }
    this.focusedDate.set(startOfDay(date));
    if (this.selectionMode() === 'range') this.previewDate.set(isSelectable(date, this.rules()) ? startOfDay(date) : null);
    this.focusActive();
  }

  private resetFocus(): void {
    const selected = this.dates().find((date): date is Date => !!date);
    const base = selected ?? this.defaultDate() ?? new Date();
    this.currentView.set(this.view());
    this.viewMonth.set(base.getMonth());
    this.viewYear.set(base.getFullYear());
    this.focusedDate.set(startOfDay(base));
    this.focusedMonth.set(base.getMonth());
    this.focusedYear.set(base.getFullYear());
  }

  private focusActive(): void {
    afterNextRender(
      () => {
        const panel = this.panelRef()?.nativeElement;
        const target = panel?.querySelector<HTMLElement>('[data-active="true"]') ?? panel?.querySelector<HTMLElement>('[tabindex="0"]');
        target?.focus();
      },
      { injector: this.injector },
    );
  }

  private openTouch(): void {
    const ref = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true,
      backdropClass: 'tx-datepicker-mask',
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });
    this.touchRef = ref;
    ref.attach(new TemplatePortal(this.panelTemplate(), this.viewContainer));
    if (ref.backdropElement) ref.backdropElement.style.background = 'var(--tx-date-picker-touch-mask-background)';
    ref.backdropClick().subscribe(() => this.close(false));
    ref.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') this.close();
    });
    afterNextRender(
      () => {
        const panel = this.panelRef()?.nativeElement;
        if (panel) txAnimateEnter(panel, 'bottom');
        this.focusActive();
      },
      { injector: this.injector },
    );
  }

  private normalize(value: TxDatePickerValue): (Date | null)[] {
    const one = (entry: Date | string | null | undefined): Date | null => {
      if (entry instanceof Date) return Number.isNaN(entry.getTime()) ? null : entry;
      if (typeof entry === 'string' && entry) return this.parseOne(entry);
      return null;
    };
    if (value === null || value === undefined) return [];
    if (Array.isArray(value)) {
      const list = (value as readonly (Date | string | null)[]).map(one);
      return this.selectionMode() === 'range' ? [list[0] ?? null, list[1] ?? null] : list.filter((date): date is Date => !!date);
    }
    const single = one(value as Date | string);
    return single ? [single] : [];
  }

  private toValue(dates: (Date | null)[]): TxDatePickerValue {
    const out = (date: Date | null) => (date && this.dataType() === 'string' ? this.formatOne(date) : date);
    switch (this.selectionMode()) {
      case 'multiple': {
        const list = dates.filter((date): date is Date => !!date);
        return list.length ? (list.map(out) as Date[] | string[]) : null;
      }
      case 'range':
        return dates[0] ? ([out(dates[0]), out(dates[1] ?? null)] as (Date | null)[] | (string | null)[]) : null;
      default:
        return dates[0] ? out(dates[0]) : null;
    }
  }

  private formatOne(date: Date): string {
    if (this.timeOnly()) return formatTime(date, this.timeFormat());
    const day = formatDate(date, this.resolvedFormat(), this.names());
    return this.showTime() ? `${day} ${formatTime(date, this.timeFormat())}` : day;
  }

  private formatValue(dates: (Date | null)[]): string {
    const present = dates.filter((date): date is Date => !!date);
    if (!present.length) return '';
    switch (this.selectionMode()) {
      case 'multiple':
        return present.map((date) => this.formatOne(date)).join(`${this.multipleSeparator()} `);
      case 'range':
        return dates[0] ? `${this.formatOne(dates[0])}${dates[1] ? ` ${this.rangeSeparator()} ${this.formatOne(dates[1])}` : ''}` : '';
      default:
        return this.formatOne(present[0]);
    }
  }

  private parseOne(text: string): Date | null {
    const value = text.trim();
    const timeFormat = this.timeFormat();
    if (this.timeOnly()) {
      const time = parseTime(value, timeFormat);
      if (!time) return null;
      const date = new Date();
      date.setHours(time.hours, time.minutes, time.seconds, 0);
      return date;
    }
    let datePart = value;
    let time: ReturnType<typeof parseTime> = null;
    if (this.showTime()) {
      const separator = timeFormat.separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = new RegExp(`\\s+(\\d{1,2}${separator}\\d{1,2}(?:${separator}\\d{1,2})?(?:\\s*[^\\s\\d]+)?)$`).exec(value);
      if (!match) return null;
      time = parseTime(match[1], timeFormat);
      if (!time) return null;
      datePart = value.slice(0, match.index);
    }
    const date = parseDate(datePart, this.resolvedFormat(), this.names(), this.shortYearCutoff());
    if (!date || !isSelectable(date, this.rules())) return null;
    if (time) date.setHours(time.hours, time.minutes, time.seconds, 0);
    return date;
  }

  private parseValue(text: string): (Date | null)[] | null {
    const mode = this.selectionMode();
    if (mode === 'single') {
      const date = this.parseOne(text);
      return date ? [date] : null;
    }
    if (mode === 'range') {
      const separator = ` ${this.rangeSeparator()} `;
      const parts = text.includes(separator) ? text.split(separator) : [text];
      if (parts.length > 2) return null;
      const start = this.parseOne(parts[0]);
      const end = parts[1]?.trim() ? this.parseOne(parts[1]) : null;
      if (!start || (parts[1]?.trim() && !end) || (end && compareDays(end, start) < 0)) return null;
      return [start, end];
    }
    const list = text
      .split(this.multipleSeparator())
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => this.parseOne(part));
    if (list.some((date) => !date)) return null;
    const max = this.maxDateCount();
    return max ? list.slice(0, max) : list;
  }
}
