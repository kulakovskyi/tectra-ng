import { InjectionToken, Signal } from '@angular/core';
import { TxRadioButtonSize, TxRadioButtonVariant } from './radio-button.types';

/** What a `tx-radio-group` shares with its buttons: name, state, look and selection. */
export interface TxRadioGroupContext {
  /** Shared `name` of the radio inputs in the group. */
  readonly name: Signal<string>;
  /** Whether the whole group is disabled. */
  readonly isDisabled: Signal<boolean>;
  /** Whether the group is shown as invalid. */
  readonly isInvalid: Signal<boolean>;
  /** Whether a choice in the group is required. */
  readonly isRequired: Signal<boolean>;
  /** Size the group sets for its buttons; `undefined` leaves it to each button. */
  readonly size: Signal<TxRadioButtonSize | undefined>;
  /** Look the group sets for its buttons; `undefined` leaves it to each button. */
  readonly variant: Signal<TxRadioButtonVariant | undefined>;
  /** Whether the given value is the selected one. */
  isChecked(value: unknown): boolean;
  /** Selects the given value as a result of the given DOM event. */
  select(value: unknown, event: Event): void;
  /** Marks the group as touched for the form control. */
  touch(): void;
}

/** Injection token through which a `tx-radio-button` finds its `tx-radio-group`. */
export const TX_RADIO_GROUP = new InjectionToken<TxRadioGroupContext>('TX_RADIO_GROUP');
