import { signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

/** Base class of form controls that implement `ControlValueAccessor` with a `value` signal. */
export abstract class TxFormControlBase<T> implements ControlValueAccessor {
  /** Current value; `null` when empty. */
  readonly value = signal<T | null>(null);
  /** Whether the control is disabled by the form. */
  readonly disabled = signal(false);

  private onChange: (value: T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** Sets the value from the form model. */
  writeValue(value: T | null): void {
    this.value.set(value);
  }

  /** Registers the callback the form calls to learn about value changes. */
  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  /** Registers the callback the form calls to learn that the control was touched. */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** Sets the disabled state from the form. */
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected updateValue(value: T | null): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected markTouched(): void {
    this.onTouched();
  }
}
