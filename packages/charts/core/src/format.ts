import { TxChartValueFormat, TxChartValueFormatter, TxTimeInterval } from './chart.types';
import { decimalsOf } from './scale';

const NUMBER_CACHE = new Map<string, Intl.NumberFormat>();
const DATE_CACHE = new Map<string, Intl.DateTimeFormat>();

export function numberFormat(intl: string, options: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  const key = `${intl}|${JSON.stringify(options)}`;
  let format = NUMBER_CACHE.get(key);
  if (!format) {
    format = new Intl.NumberFormat(intl, options);
    NUMBER_CACHE.set(key, format);
  }
  return format;
}

export function dateFormat(intl: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${intl}|${JSON.stringify(options)}`;
  let format = DATE_CACHE.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(intl, options);
    DATE_CACHE.set(key, format);
  }
  return format;
}

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

export function tickFormatter(intl: string, ticks: readonly number[], format: TxChartValueFormat = 'number'): TxChartValueFormatter {
  if (typeof format === 'function' || format === 'compact' || format === 'percent') {
    return chartNumberFormatter(intl, format);
  }
  const step = ticks.length > 1 ? Math.abs(ticks[1] - ticks[0]) : 0;
  const decimals = Math.min(2, decimalsOf(step));
  const formatter = numberFormat(intl, { minimumFractionDigits: format === 'integer' ? 0 : decimals, maximumFractionDigits: format === 'integer' ? 0 : decimals });
  return (value) => formatter.format(value);
}

export function compactNumber(value: number, intl = 'en-US'): string {
  return chartNumberFormatter(intl, 'compact')(value);
}

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

export function timeTickFormatter(intl: string, interval: TxTimeInterval, span: number): (time: number) => string {
  const formatter = dateFormat(intl, timeTickOptions(interval, span));
  return (time) => formatter.format(time);
}

export function timeTooltipFormatter(intl: string, interval: TxTimeInterval): (time: number) => string {
  const options: Intl.DateTimeFormatOptions =
    interval.unit === 'year' || interval.unit === 'month'
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : interval.unit === 'week' || interval.unit === 'day'
        ? { day: 'numeric', month: 'short', year: 'numeric' }
        : { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
  const formatter = dateFormat(intl, options);
  return (time) => formatter.format(time);
}

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

export function textWidth(text: string, fontSize = 12): number {
  let width = 0;
  for (const char of text) {
    width += NARROW.test(char) ? 0.3 : WIDE.test(char) ? 0.86 : UPPER.test(char) ? 0.66 : /\d/.test(char) ? 0.62 : 0.56;
  }
  return width * fontSize;
}

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
