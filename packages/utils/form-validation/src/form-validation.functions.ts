import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

const FOCUSABLE = 'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"]), button:not([disabled])';

export function markAllTouched(control: AbstractControl): void {
  control.markAsTouched();
  control.markAsDirty();
  if (control instanceof FormGroup || control instanceof FormArray) {
    Object.values(control.controls).forEach((child: AbstractControl) => markAllTouched(child));
  }
}

export function firstInvalidElement(scope: ParentNode): HTMLElement | null {
  const invalid = Array.from(scope.querySelectorAll<HTMLElement>('.ng-invalid:not(form)'));
  return invalid.find((element) => !element.querySelector('.ng-invalid')) ?? null;
}

export function focusTarget(element: HTMLElement): HTMLElement {
  return element.matches(FOCUSABLE) ? element : (element.querySelector<HTMLElement>(FOCUSABLE) ?? element);
}
