import {
  TxMonthCalendarDateInput,
  TxMonthCalendarDay,
  TxMonthCalendarEvent,
  TxMonthCalendarLayoutRequest,
  TxMonthCalendarMarker,
  TxMonthCalendarSegment,
  TxMonthCalendarWeek,
  TxMonthCalendarWeekday,
} from './month-calendar.types';

const DAY_MS = 86400000;
const MAX_DOTS = 3;
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

interface Item {
  event: TxMonthCalendarEvent;
  start: number;
  end: number;
  order: number;
}

/**
 * Converts a date to a whole day number (days since 1970-01-01, local calendar day); `null` when empty
 * or invalid.
 */
export function dayIndex(value: TxMonthCalendarDateInput | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  let date: Date;
  const match = typeof value === 'string' ? ISO_DAY.exec(value) : null;
  if (match) date = new Date(+match[1], +match[2] - 1, +match[3]);
  else date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

/** Converts a day number from `dayIndex` back to a local `Date` at midnight. */
export function indexToDate(index: number): Date {
  const utc = new Date(index * DAY_MS);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

function indexKey(index: number): string {
  return new Date(index * DAY_MS).toISOString().slice(0, 10);
}

function weekday(index: number): number {
  return new Date(index * DAY_MS).getUTCDay();
}

function monthOf(index: number): number {
  return new Date(index * DAY_MS).getUTCMonth();
}

function toItems(events: readonly TxMonthCalendarEvent[]): Item[] {
  const items: Item[] = [];
  events.forEach((event, order) => {
    const start = dayIndex(event.start);
    if (start === null) return;
    const end = dayIndex(event.end) ?? start;
    items.push({ event, start: Math.min(start, end), end: Math.max(start, end), order });
  });
  return items.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start) || a.order - b.order);
}

function toMarkers(markers: readonly TxMonthCalendarMarker[]): Map<number, TxMonthCalendarMarker[]> {
  const map = new Map<number, TxMonthCalendarMarker[]>();
  for (const marker of markers) {
    const index = dayIndex(marker.date);
    if (index !== null) map.set(index, [...(map.get(index) ?? []), marker]);
  }
  return map;
}

function allocate(lanes: boolean[][], from: number, to: number): number {
  let lane = lanes.findIndex((columns) => columns.slice(from, to + 1).every((busy) => !busy));
  if (lane === -1) lane = lanes.push(Array.from({ length: 7 }, () => false)) - 1;
  for (let column = from; column <= to; column++) lanes[lane][column] = true;
  return lane;
}

/** Lays out a month as weeks of days, with multi-day events as lane-packed segments and a count of hidden ones. */
export function buildMonthLayout(request: TxMonthCalendarLayoutRequest): TxMonthCalendarWeek[] {
  const year = request.month.getFullYear();
  const month = request.month.getMonth();
  const first = dayIndex(new Date(year, month, 1)) as number;
  const last = dayIndex(new Date(year, month + 1, 0)) as number;
  const start = (((request.weekStartsOn % 7) + 7) % 7);
  const gridStart = first - ((weekday(first) - start + 7) % 7);
  const weeks = Math.ceil((last - gridStart + 1) / 7);
  const items = toItems(request.events);
  const markers = toMarkers(request.markers);
  const today = dayIndex(request.today);
  const selected = dayIndex(request.selectedDate);
  const maxLanes = Math.max(0, request.maxLanes);

  return Array.from({ length: weeks }, (_, week) => {
    const weekStart = gridStart + week * 7;
    const weekEnd = weekStart + 6;
    const weekItems = items.filter((item) => item.start <= weekEnd && item.end >= weekStart);
    const lanes: boolean[][] = [];
    const hidden = Array.from({ length: 7 }, () => 0);
    const segments: TxMonthCalendarSegment[] = [];
    for (const item of weekItems) {
      const from = Math.max(item.start, weekStart) - weekStart;
      const to = Math.min(item.end, weekEnd) - weekStart;
      const lane = allocate(lanes, from, to);
      if (lane >= maxLanes) {
        for (let column = from; column <= to; column++) hidden[column]++;
        continue;
      }
      segments.push({
        key: `${item.event.id}:${weekStart}`,
        event: item.event,
        lane,
        column: from + 1,
        span: to - from + 1,
        startsHere: item.start >= weekStart,
        endsHere: item.end <= weekEnd,
      });
    }
    const days = Array.from({ length: 7 }, (_, column): TxMonthCalendarDay => {
      const index = weekStart + column;
      const day = weekday(index);
      const events = weekItems.filter((item) => item.start <= index && item.end >= index).map((item) => item.event);
      const date = indexToDate(index);
      return {
        key: indexKey(index),
        date,
        index,
        day: date.getDate(),
        column: column + 1,
        inMonth: monthOf(index) === month,
        weekend: day === 0 || day === 6,
        today: index === today,
        selected: index === selected,
        markers: markers.get(index) ?? [],
        events,
        dots: events.slice(0, MAX_DOTS).map((event) => event.tone),
        hidden: hidden[column],
      };
    });
    return { key: indexKey(weekStart), days, segments };
  });
}

/** Lists the seven weekday headings starting at the given weekday, with short and narrow names in the locale. */
export function monthWeekdays(weekStartsOn: number, locale: string): TxMonthCalendarWeekday[] {
  const short = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const narrow = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  return Array.from({ length: 7 }, (_, column) => {
    const key = (((weekStartsOn + column) % 7) + 7) % 7;
    const date = new Date(2023, 0, 1 + key);
    return { key, short: short.format(date), narrow: narrow.format(date), weekend: key === 0 || key === 6 };
  });
}
