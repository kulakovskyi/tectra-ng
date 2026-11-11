import { DestroyRef, Directive, booleanAttribute, inject, input, numberAttribute, output } from '@angular/core';

@Directive({
  selector: '[txDebounceInput]',
  exportAs: 'txDebounceInput',
  host: {
    '(input)': 'schedule($event)',
    '(keydown.enter)': 'flush($event)',
  },
})
export class TxDebounceInput {
  readonly debounceTime = input<number, unknown>(1000, { transform: numberAttribute });
  readonly distinct = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly minLength = input<number, unknown>(0, { transform: numberAttribute });

  readonly debounceInput = output<Event>();
  readonly debounceValue = output<string>();

  private timeout: ReturnType<typeof setTimeout> | null = null;
  private pending: Event | null = null;
  private lastValue: string | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancel());
  }

  schedule(event: Event): void {
    this.cancel();
    this.pending = event;
    this.timeout = setTimeout(() => this.emit(event), this.debounceTime());
  }

  flush(event?: Event): void {
    const pending = this.pending ?? event;
    this.cancel();
    if (pending) {
      this.emit(pending, true);
    }
  }

  cancel(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = null;
    this.pending = null;
  }

  private emit(event: Event, forced = false): void {
    this.timeout = null;
    this.pending = null;
    const value = valueOf(event);
    if (value.length > 0 && value.trim().length < this.minLength()) {
      return;
    }
    if (!forced && this.distinct() && value === this.lastValue) {
      return;
    }
    this.lastValue = value;
    this.debounceInput.emit(event);
    this.debounceValue.emit(value);
  }
}

function valueOf(event: Event): string {
  const target = event.target as { value?: unknown } | null;
  return typeof target?.value === 'string' ? target.value : '';
}
