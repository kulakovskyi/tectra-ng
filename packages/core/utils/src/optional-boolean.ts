import { booleanAttribute } from '@angular/core';

/**
 * Input transform for a boolean that may be unset: `undefined` and `null` stay `undefined`, other values go
 * through `booleanAttribute`.
 */
export function optionalBoolean(value: unknown): boolean | undefined {
  return value === undefined || value === null ? undefined : booleanAttribute(value);
}
