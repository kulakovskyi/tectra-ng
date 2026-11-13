import { DestroyRef, Injectable, Signal, computed, inject, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

const isEmpty = (value: unknown): boolean => value === null || value === undefined || value === '';

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return isEmpty(a) && isEmpty(b);
  }
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((key) => deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
}

function snapshot(control: AbstractControl): unknown {
  const raw = 'getRawValue' in control && typeof control.getRawValue === 'function' ? control.getRawValue() : control.value;
  return structuredClone(raw);
}

/** Remembers the initial value of a form and tells whether it changed; provide it per component. */
@Injectable()
export class TxFormChangeTracker {
  private initial: unknown = null;
  private tracking = false;

  initFormTracking(form: AbstractControl): void {
    this.initial = snapshot(form);
    this.tracking = true;
  }

  hasFormChanges(form: AbstractControl): boolean {
    return this.tracking && !deepEqual(snapshot(form), this.initial);
  }

  updateInitialFormState(form: AbstractControl): void {
    this.initFormTracking(form);
  }

  resetFormToInitial(form: AbstractControl): void {
    if (this.tracking) {
      form.reset(structuredClone(this.initial), { emitEvent: true });
    }
  }

  resetFormTracking(): void {
    this.initial = null;
    this.tracking = false;
  }
}

/** Change tracking of one form, created by `trackFormChanges`. */
export interface TxFormChanges {
  /** `true` while the form value differs from the saved one. */
  readonly changed: Signal<boolean>;
  /** Takes the current value as the new initial one. */
  commit(): void;
  /** Resets the form to the initial value. */
  revert(): void;
}

export function trackFormChanges(form: AbstractControl): TxFormChanges {
  const initial = signal(snapshot(form));
  const current = signal(snapshot(form));
  const subscription = form.valueChanges.subscribe(() => current.set(snapshot(form)));
  inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  return {
    changed: computed(() => !deepEqual(current(), initial())),
    commit: () => initial.set(snapshot(form)),
    revert: () => form.reset(structuredClone(initial())),
  };
}
