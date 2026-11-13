import { TxHeatmapCalendar, TxHeatmapCalendarOptions, TxHeatmapCalendarValue, TxHeatmapCell, TxHeatmapColumnGroup, TxHeatmapRow } from './heatmap.types';

const DAY = 86_400_000;

function toDay(value: string | Date): number {
  const date = typeof value === 'string' ? new Date(`${value.slice(0, 10)}T00:00:00Z`) : new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  return Math.floor(date.getTime() / DAY);
}

function dayKey(day: number): string {
  return new Date(day * DAY).toISOString().slice(0, 10);
}

/** Turns day values into a calendar heatmap: a band per month, a column per week and a row per weekday. */
export function heatmapCalendar(values: readonly TxHeatmapCalendarValue[], options: TxHeatmapCalendarOptions): TxHeatmapCalendar {
  const intl = options.intl ?? 'en-US';
  const firstDay = ((options.firstDayOfWeek ?? 1) % 7 + 7) % 7;
  const from = toDay(options.from);
  const to = toDay(options.to);
  const byDay = new Map<number, TxHeatmapCalendarValue>();
  for (const item of values) {
    byDay.set(toDay(item.date), item);
  }
  const weekday = (day: number) => (new Date(day * DAY).getUTCDay() - firstDay + 7) % 7;
  const start = from - weekday(from);
  const weeks = to < from ? 0 : Math.floor((to - start) / 7) + 1;
  const monthFormat = new Intl.DateTimeFormat(intl, { month: 'short', timeZone: 'UTC' });
  const dayFormat = new Intl.DateTimeFormat(intl, { weekday: 'short', timeZone: 'UTC' });
  const dateFormat = new Intl.DateTimeFormat(intl, { dateStyle: 'medium', timeZone: 'UTC' });
  const numberFormat = options.format ?? new Intl.NumberFormat(intl).format;

  const groups: TxHeatmapColumnGroup[] = [];
  for (let week = 0; week < weeks; week++) {
    const first = Math.max(start + week * 7, from);
    const date = new Date(first * DAY);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, label: monthFormat.format(date), columns: [] };
      groups.push(group);
    }
    group.columns.push({ key: dayKey(start + week * 7), label: '' });
  }

  const rows: TxHeatmapRow[] = Array.from({ length: 7 }, (_, index) => {
    const cells: (TxHeatmapCell | null)[] = [];
    for (let week = 0; week < weeks; week++) {
      const day = start + week * 7 + index;
      if (day < from || day > to) {
        cells.push({ hidden: true });
        continue;
      }
      const item = byDay.get(day);
      const value = item?.value ?? 0;
      const label = `${dateFormat.format(new Date(day * DAY))}: ${numberFormat(value)}`;
      cells.push({ value, tooltip: item?.tooltip ?? label, ariaLabel: label, interactive: options.interactive, data: item?.data ?? dayKey(day) });
    }
    return { key: `day-${index}`, label: dayFormat.format(new Date((start + index) * DAY)), cells };
  });

  return { groups, rows };
}
