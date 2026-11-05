import { numberAttribute } from '@angular/core';

export function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const number = numberAttribute(value);
  return Number.isNaN(number) ? undefined : number;
}
