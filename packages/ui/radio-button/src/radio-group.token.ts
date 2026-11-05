import { InjectionToken, Signal } from '@angular/core';
import { TxRadioButtonSize, TxRadioButtonVariant } from './radio-button.types';

export interface TxRadioGroupContext {
  readonly name: Signal<string>;
  readonly isDisabled: Signal<boolean>;
  readonly isInvalid: Signal<boolean>;
  readonly isRequired: Signal<boolean>;
  readonly size: Signal<TxRadioButtonSize | undefined>;
  readonly variant: Signal<TxRadioButtonVariant | undefined>;
  isChecked(value: unknown): boolean;
  select(value: unknown, event: Event): void;
  touch(): void;
}

export const TX_RADIO_GROUP = new InjectionToken<TxRadioGroupContext>('TX_RADIO_GROUP');
