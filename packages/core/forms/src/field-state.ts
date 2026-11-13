import { InjectionToken, Signal } from '@angular/core';

/** State a form field shares with the controls inside it. */
export interface TxFieldState {
  /** Whether the field is in the invalid state. */
  readonly invalid: Signal<boolean>;
}

/** Injection token a form field provides so the controls inside it can follow its state. */
export const TX_FIELD_STATE = new InjectionToken<TxFieldState>('TX_FIELD_STATE');
