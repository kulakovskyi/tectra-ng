import { HttpParams } from '@angular/common/http';

function toParamValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

const isEmpty = (value: unknown): boolean => value === undefined || value === null || value === '';

export function buildHttpParams(query: object): HttpParams {
  let params = new HttpParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.filter((item) => !isEmpty(item)).forEach((item) => (params = params.append(key, toParamValue(item))));
    } else if (!isEmpty(value)) {
      params = params.set(key, toParamValue(value));
    }
  });
  return params;
}
