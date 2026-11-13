import { InjectionToken, Signal } from '@angular/core';
import { TxCheckboxSize, TxCheckboxVariant } from './checkbox.types';

/** What a checkbox needs from the `tx-checkbox-group` around it. */
export interface TxCheckboxGroupContext {
  /** Shared `name` of the checkboxes. */
  readonly name: Signal<string | undefined>;
  /** Whether the whole group is disabled. */
  readonly isDisabled: Signal<boolean>;
  /** Whether the group shows the invalid state. */
  readonly isInvalid: Signal<boolean>;
  /** Size the group gives to its checkboxes. */
  readonly size: Signal<TxCheckboxSize | undefined>;
  /** Look the group gives to its checkboxes. */
  readonly variant: Signal<TxCheckboxVariant | undefined>;
  /** Tells whether the value is among the checked ones. */
  isChecked(value: unknown): boolean;
  /** Adds the value to the checked ones or removes it. */
  toggle(value: unknown, checked: boolean): void;
  /** Tells the group about a checkbox value, for "select all"; returns a function that withdraws it. */
  register(value: unknown): () => void;
  /** Marks the group as touched, as a blur does. */
  touch(): void;
}

/** Lets a checkbox read its `tx-checkbox-group`: the shared name, state and the list of checked values. */
export const TX_CHECKBOX_GROUP = new InjectionToken<TxCheckboxGroupContext>('TX_CHECKBOX_GROUP');
