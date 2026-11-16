/** Reads a value by field name, with dots for nested fields; `undefined` when a step is missing. */
export function resolveField(row: unknown, field: string | undefined): unknown {
  if (!field || row === null || row === undefined) return undefined;
  return field.split('.').reduce<unknown>((value, key) => (value === null || value === undefined ? undefined : (value as Record<string, unknown>)[key]), row);
}

/** How a filter value is compared with a cell: text, number, list, range and date comparisons. */
export type TxFilterMatchMode =
  | 'startsWith'
  | 'contains'
  | 'notContains'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'in'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between'
  | 'dateIs'
  | 'dateIsNot'
  | 'dateBefore'
  | 'dateAfter';

/** One condition of a column filter: a value and how to compare it. */
export interface TxFilterRule {
  /** Value to compare with; an empty value is ignored. */
  value: unknown;
  /** How the cell value is compared with the filter value. */
  matchMode: TxFilterMatchMode;
}

/** Whether a filter value is set: not empty, not blank text and not an empty list. */
export function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function normalize(value: unknown, locale?: string): string {
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase(locale);
}

function toTime(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function dayOf(value: unknown): string | null {
  const time = toTime(value);
  return time === null ? null : new Date(time).toDateString();
}

function compare(value: unknown, filter: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' || typeof filter === 'number') {
    const left = Number(value);
    const right = Number(filter);
    return Number.isNaN(left) || Number.isNaN(right) ? null : left - right;
  }
  const left = toTime(value);
  const right = toTime(filter);
  if (value instanceof Date && left !== null && right !== null) return left - right;
  return String(value).localeCompare(String(filter), undefined, { numeric: true, sensitivity: 'base' });
}

/** Whether a cell value passes one filter rule; an empty rule passes everything. */
export function matchesRule(value: unknown, rule: TxFilterRule, locale?: string): boolean {
  const filter = rule.value;
  if (!isFilled(filter)) return true;
  const text = value === null || value === undefined ? '' : normalize(value, locale);
  const needle = typeof filter === 'string' || typeof filter === 'number' ? normalize(filter, locale) : '';
  switch (rule.matchMode) {
    case 'startsWith':
      return text.startsWith(needle);
    case 'contains':
      return text.includes(needle);
    case 'notContains':
      return !text.includes(needle);
    case 'endsWith':
      return text.endsWith(needle);
    case 'equals':
      if (typeof filter === 'boolean') return value === filter;
      if (typeof filter === 'number') return Number(value) === filter;
      if (filter instanceof Date) return toTime(value) === toTime(filter);
      return text === needle;
    case 'notEquals':
      if (typeof filter === 'boolean') return value !== filter;
      if (typeof filter === 'number') return Number(value) !== filter;
      if (filter instanceof Date) return toTime(value) !== toTime(filter);
      return text !== needle;
    case 'in':
      return Array.isArray(filter) && filter.some((item) => item === value || (item !== null && value !== null && normalize(item, locale) === text));
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte': {
      const result = compare(value, filter);
      if (result === null) return false;
      return rule.matchMode === 'lt' ? result < 0 : rule.matchMode === 'lte' ? result <= 0 : rule.matchMode === 'gt' ? result > 0 : result >= 0;
    }
    case 'between': {
      const [from, to] = Array.isArray(filter) ? filter : [];
      const fromResult = isFilled(from) ? compare(value, from) : 0;
      const toResult = isFilled(to) ? compare(value, to) : 0;
      return fromResult !== null && toResult !== null && fromResult >= 0 && toResult <= 0;
    }
    case 'dateIs':
      return dayOf(value) !== null && dayOf(value) === dayOf(filter);
    case 'dateIsNot':
      return dayOf(value) !== dayOf(filter);
    case 'dateBefore': {
      const left = toTime(value);
      const right = toTime(filter);
      return left !== null && right !== null && left < right;
    }
    case 'dateAfter': {
      const left = toTime(value);
      const right = toTime(filter);
      return left !== null && right !== null && left > right;
    }
  }
}
