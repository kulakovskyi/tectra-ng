import { numberAttribute } from '@angular/core';

/** Input transform for a number that may be unset: empty and non-numeric values become `undefined`. */
export function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const number = numberAttribute(value);
  return Number.isNaN(number) ? undefined : number;
}
