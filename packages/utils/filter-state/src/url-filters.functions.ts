import { Params } from '@angular/router';

/** Compares two values by their JSON text. */
export function isSameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isJson(value: string): boolean {
  if (value === '') {
    return false;
  }
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export function encodeUrlFilterValue(value: unknown): string {
  if (typeof value !== 'string') {
    return JSON.stringify(value);
  }
  return isJson(value) ? JSON.stringify(value) : value;
}

/** Turns a query parameter back into a filter value: parsed when it is JSON, otherwise the plain text. */
export function decodeUrlFilterValue(value: string): unknown {
  return isJson(value) ? JSON.parse(value) : value;
}

export function filtersToQueryParams<T extends object>(filters: T, initial: T): Params {
  return (Object.keys(initial) as (keyof T & string)[]).reduce<Params>((params, key) => {
    params[key] = isSameValue(filters[key], initial[key]) ? null : encodeUrlFilterValue(filters[key]);
    return params;
  }, {});
}

export function queryParamsToFilters<T extends object>(params: Params, initial: T): T | null {
  const keys = Object.keys(initial).filter((key) => key in params);
  if (!keys.length) {
    return null;
  }
  return keys.reduce<T>((filters, key) => ({ ...filters, [key]: decodeUrlFilterValue(String(params[key])) }), { ...initial });
}
