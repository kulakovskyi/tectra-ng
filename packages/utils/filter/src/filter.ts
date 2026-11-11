import { Pipe, PipeTransform } from '@angular/core';
import { TxFilterMatchMode, matchesRule, resolveField } from '@tectra-ng/ui/table';

export type TxMatchFunction = (value: unknown, filter: unknown, locale?: string) => boolean;
export type TxFilterFields<T> = readonly string[] | ((item: T) => readonly unknown[]);

export { resolveField };

export function normalizeSearch(value: unknown, locale?: string): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase(locale);
}

function valuesOf<T>(item: T, fields: TxFilterFields<T>): readonly unknown[] {
  return typeof fields === 'function' ? fields(item) : fields.map((field) => resolveField(item, field));
}

export function filterBySearch<T>(items: readonly T[], query: string | null | undefined, fields: TxFilterFields<T>, locale?: string): T[] {
  const needle = normalizeSearch(query, locale);
  if (!needle) {
    return [...items];
  }
  return items.filter((item) =>
    valuesOf(item, fields)
      .filter((value) => value !== null && value !== undefined && value !== '')
      .some((value) => normalizeSearch(value, locale).includes(needle)),
  );
}

export function matches(value: unknown, filter: unknown, matchMode: TxFilterMatchMode | TxMatchFunction = 'contains', locale?: string): boolean {
  return typeof matchMode === 'function' ? matchMode(value, filter, locale) : matchesRule(value, { value: filter, matchMode }, locale);
}

export function filterBy<T>(items: readonly T[], filter: unknown, fields: TxFilterFields<T>, matchMode: TxFilterMatchMode | TxMatchFunction = 'contains', locale?: string): T[] {
  return items.filter((item) => valuesOf(item, fields).some((value) => matches(value, filter, matchMode, locale)));
}

@Pipe({ name: 'txSearch' })
export class TxSearchPipe implements PipeTransform {
  transform<T>(items: readonly T[] | null | undefined, query: string | null | undefined, fields: TxFilterFields<T>): T[] {
    return filterBySearch(items ?? [], query, fields);
  }
}

@Pipe({ name: 'txFilterBy' })
export class TxFilterByPipe implements PipeTransform {
  transform<T>(items: readonly T[] | null | undefined, filter: unknown, fields: TxFilterFields<T>, matchMode: TxFilterMatchMode | TxMatchFunction = 'contains'): T[] {
    return filterBy(items ?? [], filter, fields, matchMode);
  }
}
