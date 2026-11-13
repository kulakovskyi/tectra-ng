/** One day cell of the calendar. */
export interface TxCalendarDay {
  /** The date of the cell. */
  date: Date;
  /** Day of the month, 1 to 31. */
  day: number;
  /** Month of the day, 0 for January. */
  month: number;
  /** Year of the day. */
  year: number;
  /** Whether the day belongs to the previous or next month. */
  otherMonth: boolean;
  /** Whether the day is today. */
  today: boolean;
  /** Whether the day can be picked under the date rules. */
  selectable: boolean;
}

/** One row of the calendar. */
export interface TxCalendarWeek {
  /** Week number of the row. */
  number: number;
  /** The seven days of the row. */
  days: TxCalendarDay[];
}

/** One month of the calendar with its weeks. */
export interface TxCalendarMonth {
  /** Month number, 0 for January. */
  month: number;
  /** Year of the month. */
  year: number;
  /** Rows of the month, each of seven days. */
  weeks: TxCalendarWeek[];
}

/** Which dates cannot be picked. */
export interface TxDateRules {
  /** Earliest day that can be picked. */
  minDate?: Date | null;
  /** Latest day that can be picked. */
  maxDate?: Date | null;
  /** Single days that cannot be picked. */
  disabledDates?: readonly Date[] | null;
  /** Weekdays that cannot be picked, 0 for Sunday to 6 for Saturday. */
  disabledDays?: readonly number[] | null;
}

/** Returns a new date at 00:00 of the same day. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Tells whether two dates fall on the same calendar day; `false` when either is empty. */
export function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Compares two dates by calendar day; negative when `a` is earlier, positive when later, `0` on the same day.
 */
export function compareDays(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

/** Returns a new date moved by the given number of days, back when negative. */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Returns a new date moved by the given number of months; the day is cut to the last day of a shorter month.
 */
export function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1, date.getHours(), date.getMinutes(), date.getSeconds());
  next.setDate(Math.min(date.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
  return next;
}

/** Tells whether a day passes the min, max, disabled days and disabled dates rules. */
export function isSelectable(date: Date, rules: TxDateRules): boolean {
  if (rules.minDate && compareDays(date, rules.minDate) < 0) return false;
  if (rules.maxDate && compareDays(date, rules.maxDate) > 0) return false;
  if (rules.disabledDays?.includes(date.getDay())) return false;
  if (rules.disabledDates?.some((disabled) => sameDay(disabled, date))) return false;
  return true;
}

/** Tells whether any day of the month (0 for January) is inside the min and max dates. */
export function isMonthSelectable(year: number, month: number, rules: TxDateRules): boolean {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return !(rules.minDate && compareDays(last, rules.minDate) < 0) && !(rules.maxDate && compareDays(first, rules.maxDate) > 0);
}

/** Tells whether the year is inside the min and max dates. */
export function isYearSelectable(year: number, rules: TxDateRules): boolean {
  return !(rules.minDate && year < rules.minDate.getFullYear()) && !(rules.maxDate && year > rules.maxDate.getFullYear());
}

/** Week number of a date: the ISO 8601 week, or counted from January 1 when `fromFirstDayOfYear` is set. */
export function weekNumber(date: Date, fromFirstDayOfYear = false): number {
  if (fromFirstDayOfYear) {
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.floor((compareDays(date, start) / 86400000 + start.getDay()) / 7) + 1;
  }
  const thursday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  return 1 + Math.round((compareDays(thursday, firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
}

/**
 * Builds the weeks of a month (0 for January) for the calendar, with days of the neighbour months filling the first and last week.
 */
export function buildMonth(year: number, month: number, firstDayOfWeek: number, rules: TxDateRules, today: Date, fromFirstDayOfYear = false): TxCalendarMonth {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - firstDayOfWeek + 7) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const count = Math.ceil((offset + daysInMonth) / 7);
  const weeks: TxCalendarWeek[] = [];
  for (let week = 0; week < count; week++) {
    const days: TxCalendarDay[] = [];
    for (let column = 0; column < 7; column++) {
      const date = new Date(year, month, 1 - offset + week * 7 + column);
      days.push({
        date,
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        otherMonth: date.getMonth() !== month,
        today: sameDay(date, today),
        selectable: isSelectable(date, rules),
      });
    }
    const thursdayIndex = days.findIndex((day) => day.date.getDay() === 4);
    weeks.push({ number: weekNumber(days[thursdayIndex >= 0 ? thursdayIndex : 0].date, fromFirstDayOfYear), days });
  }
  return { month, year, weeks };
}

/** Lists the weekday numbers (0 Sunday to 6 Saturday) starting from the first day of the week. */
export function weekdayOrder(firstDayOfWeek: number): number[] {
  return Array.from({ length: 7 }, (_, index) => (firstDayOfWeek + index) % 7);
}
