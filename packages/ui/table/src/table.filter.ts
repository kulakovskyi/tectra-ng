import { TxColumnFilter, TxFilterMatchMode, TxFilterRule, TxTableColumn, TxTableFilterType, TxTableFilters } from './table.types';
import { resolveField } from './table.utils';

/** Match modes offered for each filter type; the first one is the default. */
export const TX_FILTER_MATCH_MODES: Record<TxTableFilterType, TxFilterMatchMode[]> = {
  text: ['startsWith', 'contains', 'notContains', 'endsWith', 'equals', 'notEquals'],
  numeric: ['equals', 'notEquals', 'lt', 'lte', 'gt', 'gte'],
  date: ['dateIs', 'dateIsNot', 'dateBefore', 'dateAfter'],
  boolean: ['equals'],
};

/** Match mode a column filter starts with: `in` with options, otherwise the first mode of its type. */
export function defaultMatchMode(column: TxTableColumn): TxFilterMatchMode {
  if (column.filterOptions?.length) return 'in';
  return (column.filterMatchModes ?? TX_FILTER_MATCH_MODES[column.filterType ?? 'text'])[0];
}

/** Whether a filter value is set: not empty, not blank text and not an empty list. */
export function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/** Whether a column filter has at least one rule with a value. */
export function isFilterActive(filter: TxColumnFilter | undefined): boolean {
  return !!filter?.rules.some((rule) => isFilled(rule.value));
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

/** Whether a cell value passes the rules of a column filter, joined by its operator. */
export function matchesFilter(value: unknown, filter: TxColumnFilter, locale?: string): boolean {
  const rules = filter.rules.filter((rule) => isFilled(rule.value));
  if (!rules.length) return true;
  return filter.operator === 'or' ? rules.some((rule) => matchesRule(value, rule, locale)) : rules.every((rule) => matchesRule(value, rule, locale));
}

/** Returns the rows that pass the column filters and the global search; case and accents are ignored. */
export function filterRows<T>(
  rows: readonly T[],
  filters: TxTableFilters,
  columns: readonly TxTableColumn[],
  globalFilter: string,
  globalFields: readonly string[],
  locale?: string,
): T[] {
  const active = Object.entries(filters).filter(([, filter]) => isFilterActive(filter));
  const query = globalFilter.trim() ? normalize(globalFilter.trim(), locale) : '';
  if (!active.length && !query) return [...rows];
  const fieldOf = (key: string) => columns.find((column) => column.field === key)?.filterField ?? key;
  return rows.filter((row) => {
    const columnsMatch = active.every(([key, filter]) => matchesFilter(resolveField(row, fieldOf(key)), filter, locale));
    if (!columnsMatch) return false;
    if (!query) return true;
    return globalFields.some((field) => {
      const value = resolveField(row, field);
      return value !== null && value !== undefined && normalize(value, locale).includes(query);
    });
  });
}
