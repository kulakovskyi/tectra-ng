import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { parseHex } from './color';

export function txColorHexValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }
    return parseHex(value) ? null : { pattern: { requiredPattern: '#rrggbb', actualValue: value } };
  };
}
