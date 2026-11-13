import { DAYS_IN_WEEK, MS_IN_DAY, MS_IN_WEEK } from './date.constants';
import { TxDateInput, TxIsoRange } from './date.types';

const MIDDLE_OF_DAY_HOUR = 12;

export function toDate(value: TxDateInput): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isValidDate(value: TxDateInput): boolean {
  return toDate(value) !== null;
}

function copy(value: Date | string | number): Date {
  return value instanceof Date ? new Date(value.getTime()) : new Date(value);
}

export function startOfDay(value: Date | string | number): Date {
  const date = copy(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Returns a copy of the date set to 12:00 local time, away from the daylight-saving shifts around midnight. */
export function middleOfDay(value: Date | string | number): Date {
  const date = copy(value);
  date.setHours(MIDDLE_OF_DAY_HOUR, 0, 0, 0);
  return date;
}

/** Returns a copy of the date set to the last millisecond of the day, 23:59:59.999 local time. */
export function endOfDay(value: Date | string | number): Date {
  const date = copy(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function addDays(value: Date | string | number, days: number): Date {
  const date = copy(value);
  date.setDate(date.getDate() + days);
  return date;
}

export function addMonths(value: Date | string | number, months: number): Date {
  const date = copy(value);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return date;
}

export function addYears(value: Date | string | number, years: number): Date {
  return addMonths(value, years * 12);
}

export function startOfWeek(value: Date | string | number, firstDayOfWeek = 1): Date {
  const date = startOfDay(value);
  date.setDate(date.getDate() - ((date.getDay() - firstDayOfWeek + DAYS_IN_WEEK) % DAYS_IN_WEEK));
  return date;
}

export function calendarDaysBetween(from: Date | string | number, to: Date | string | number): number {
  const start = startOfDay(from);
  const end = startOfDay(to);
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endUtc - startUtc) / MS_IN_DAY);
}

export function isSameDay(a: TxDateInput, b: TxDateInput): boolean {
  const first = toDate(a);
  const second = toDate(b);
  return !!first && !!second && calendarDaysBetween(first, second) === 0;
}

export function toIsoDay(value: Date | string | number): string {
  const date = copy(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function toIsoString(value: TxDateInput): string | undefined {
  if (typeof value === 'string') {
    return value || undefined;
  }
  return toDate(value)?.toISOString();
}

export function toIsoRange(range: readonly TxDateInput[] | null | undefined): TxIsoRange | null {
  if (!range || range.length !== 2) {
    return null;
  }
  const start = toDate(range[0]);
  const end = toDate(range[1]);
  return start && end ? { start: start.toISOString(), end: end.toISOString() } : null;
}

export function isExpiringWithin(value: TxDateInput, periodMs = MS_IN_WEEK, now: Date | number = Date.now()): boolean {
  const date = toDate(value);
  return !!date && date.getTime() - new Date(now).getTime() <= periodMs;
}
