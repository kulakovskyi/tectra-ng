import { TxFilterMatchMode, isFilled, matchesRule, resolveField } from '@tectra-ng/core/utils';
import { TxColumnFilter, TxTableColumn, TxTableFilterType, TxTableFilters } from './table.types';

export { isFilled, matchesRule };

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
