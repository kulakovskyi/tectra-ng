import { InjectionToken, Signal } from '@angular/core';
import { TxCheckboxSize, TxCheckboxVariant } from './checkbox.types';

export interface TxCheckboxGroupContext {
  readonly name: Signal<string | undefined>;
  readonly isDisabled: Signal<boolean>;
  readonly isInvalid: Signal<boolean>;
  readonly size: Signal<TxCheckboxSize | undefined>;
  readonly variant: Signal<TxCheckboxVariant | undefined>;
  isChecked(value: unknown): boolean;
  toggle(value: unknown, checked: boolean): void;
  register(value: unknown): () => void;
  touch(): void;
}

export const TX_CHECKBOX_GROUP = new InjectionToken<TxCheckboxGroupContext>('TX_CHECKBOX_GROUP');
