export interface TxCalendarDay {
  date: Date;
  day: number;
  month: number;
  year: number;
  otherMonth: boolean;
  today: boolean;
  selectable: boolean;
}

export interface TxCalendarWeek {
  number: number;
  days: TxCalendarDay[];
}

export interface TxCalendarMonth {
  month: number;
  year: number;
  weeks: TxCalendarWeek[];
}

export interface TxDateRules {
  minDate?: Date | null;
  maxDate?: Date | null;
  disabledDates?: readonly Date[] | null;
  disabledDays?: readonly number[] | null;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function compareDays(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1, date.getHours(), date.getMinutes(), date.getSeconds());
  next.setDate(Math.min(date.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
  return next;
}

export function isSelectable(date: Date, rules: TxDateRules): boolean {
  if (rules.minDate && compareDays(date, rules.minDate) < 0) return false;
  if (rules.maxDate && compareDays(date, rules.maxDate) > 0) return false;
  if (rules.disabledDays?.includes(date.getDay())) return false;
  if (rules.disabledDates?.some((disabled) => sameDay(disabled, date))) return false;
  return true;
}

export function isMonthSelectable(year: number, month: number, rules: TxDateRules): boolean {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return !(rules.minDate && compareDays(last, rules.minDate) < 0) && !(rules.maxDate && compareDays(first, rules.maxDate) > 0);
}

export function isYearSelectable(year: number, rules: TxDateRules): boolean {
  return !(rules.minDate && year < rules.minDate.getFullYear()) && !(rules.maxDate && year > rules.maxDate.getFullYear());
}

export function weekNumber(date: Date, fromFirstDayOfYear = false): number {
  if (fromFirstDayOfYear) {
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.floor((compareDays(date, start) / 86400000 + start.getDay()) / 7) + 1;
  }
  const thursday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  return 1 + Math.round((compareDays(thursday, firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
}

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

export function weekdayOrder(firstDayOfWeek: number): number[] {
  return Array.from({ length: 7 }, (_, index) => (firstDayOfWeek + index) % 7);
}
