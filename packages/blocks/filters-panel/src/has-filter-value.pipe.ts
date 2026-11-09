import { Pipe, PipeTransform } from '@angular/core';

export function hasFilterValue(...values: unknown[]): boolean {
  return values.some((value) => {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  });
}

@Pipe({ name: 'hasFilterValue' })
export class TxHasFilterValuePipe implements PipeTransform {
  transform(...values: unknown[]): boolean {
    return hasFilterValue(...values);
  }
}
