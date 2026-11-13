import { TxChartValueFormat, TxChartValueFormatter, TxTimeInterval } from './chart.types';
import { decimalsOf } from './scale';

const NUMBER_CACHE = new Map<string, Intl.NumberFormat>();
const DATE_CACHE = new Map<string, Intl.DateTimeFormat>();

/** Cached `Intl.NumberFormat` for a locale and options. */
export function numberFormat(intl: string, options: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  const key = `${intl}|${JSON.stringify(options)}`;
  let format = NUMBER_CACHE.get(key);
  if (!format) {
    format = new Intl.NumberFormat(intl, options);
    NUMBER_CACHE.set(key, format);
  }
  return format;
}

/** Cached `Intl.DateTimeFormat` for a locale and options. */
export function dateFormat(intl: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${intl}|${JSON.stringify(options)}`;
  let format = DATE_CACHE.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(intl, options);
    DATE_CACHE.set(key, format);
  }
  return format;
}

/**
 * Builds the value formatter of a chart for a locale and a `TxChartValueFormat`; `percent` takes
 * values already in percent.
 */
export function chartNumberFormatter(intl: string, format: TxChartValueFormat = 'number'): TxChartValueFormatter {
  if (typeof format === 'function') {
    return format;
  }
  const options: Intl.NumberFormatOptions =
    format === 'integer'
      ? { maximumFractionDigits: 0 }
      : format === 'compact'
        ? { notation: 'compact', maximumFractionDigits: 1 }
        : format === 'percent'
          ? { style: 'percent', maximumFractionDigits: 1 }
          : { maximumFractionDigits: 2 };
  const formatter = numberFormat(intl, options);
  return (value) => (Number.isFinite(value) ? formatter.format(format === 'percent' ? value / 100 : value) : '');
}

/**
 * Like `chartNumberFormatter` but writes `number` and `integer` ticks with as many decimals as the
 * tick step needs.
 */
export function tickFormatter(intl: string, ticks: readonly number[], format: TxChartValueFormat = 'number'): TxChartValueFormatter {
  if (typeof format === 'function' || format === 'compact' || format === 'percent') {
    return chartNumberFormatter(intl, format);
  }
  const step = ticks.length > 1 ? Math.abs(ticks[1] - ticks[0]) : 0;
  const decimals = Math.min(2, decimalsOf(step));
  const formatter = numberFormat(intl, { minimumFractionDigits: format === 'integer' ? 0 : decimals, maximumFractionDigits: format === 'integer' ? 0 : decimals });
  return (value) => formatter.format(value);
}

/** Writes a number in compact form, for example `1234567` as `1.2M`. */
export function compactNumber(value: number, intl = 'en-US'): string {
  return chartNumberFormatter(intl, 'compact')(value);
}

/** `Intl.DateTimeFormat` options for tick labels of a time step over a time span in ms. */
export function timeTickOptions(interval: TxTimeInterval, span: number): Intl.DateTimeFormatOptions {
  const multiYear = span > 366 * 24 * 3600 * 1000;
  switch (interval.unit) {
    case 'year':
      return { year: 'numeric' };
    case 'month':
      return multiYear ? { month: 'short', year: 'numeric' } : { month: 'short' };
    case 'week':
    case 'day':
      return { day: 'numeric', month: 'short' };
    case 'hour':
    case 'minute':
      return { hour: '2-digit', minute: '2-digit' };
    default:
      return { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  }
}

/** Formats time axis ticks for a calendar step and the time span in ms. */
export function timeTickFormatter(intl: string, interval: TxTimeInterval, span: number): (time: number) => string {
  const formatter = dateFormat(intl, timeTickOptions(interval, span));
  return (time) => formatter.format(time);
}

/** Formats the time in a tooltip: a full date, with hours and minutes for steps below a day. */
export function timeTooltipFormatter(intl: string, interval: TxTimeInterval): (time: number) => string {
  const wholeDays = interval.unit === 'year' || interval.unit === 'month' || interval.unit === 'week' || interval.unit === 'day';
  const options: Intl.DateTimeFormatOptions = wholeDays
    ? { day: 'numeric', month: 'short', year: 'numeric' }
    : { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
  const formatter = dateFormat(intl, options);
  return (time) => formatter.format(time);
}

/** The 12 month names of a locale, capitalised, in `long` or `short` form. */
export function chartMonthNames(intl: string, month: 'long' | 'short' = 'long'): string[] {
  const formatter = dateFormat(intl, { month });
  return Array.from({ length: 12 }, (_, index) => {
    const name = formatter.format(new Date(2024, index, 15));
    return name.charAt(0).toLocaleUpperCase(intl) + name.slice(1);
  });
}

const NARROW = /[.,:;!|il'`ijIft ]/;
const WIDE = /[MWmw@%]/;
const UPPER = /[A-ZА-ЯЁЇІЄҐ]/;

/**
 * Estimates the width of a text in px without measuring, so the layout is the same on the server and
 * in the browser.
 */
export function textWidth(text: string, fontSize = 12): number {
  let width = 0;
  for (const char of text) {
    width += NARROW.test(char) ? 0.3 : WIDE.test(char) ? 0.86 : UPPER.test(char) ? 0.66 : /\d/.test(char) ? 0.62 : 0.56;
  }
  return width * fontSize;
}

/** Shortens a text with an ellipsis so that its estimated width fits `maxWidth`. */
export function truncateText(text: string, maxWidth: number, fontSize = 12): string {
  if (textWidth(text, fontSize) <= maxWidth) {
    return text;
  }
  const chars = [...text];
  while (chars.length > 1 && textWidth(`${chars.join('')}…`, fontSize) > maxWidth) {
    chars.pop();
  }
  return `${chars.join('').trimEnd()}…`;
}
