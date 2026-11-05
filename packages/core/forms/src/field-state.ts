import { InjectionToken, Signal } from '@angular/core';

export interface TxFieldState {
  readonly invalid: Signal<boolean>;
}

export const TX_FIELD_STATE = new InjectionToken<TxFieldState>('TX_FIELD_STATE');
