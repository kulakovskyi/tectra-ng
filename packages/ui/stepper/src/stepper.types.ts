import { TxIconName } from '@tectra-ng/icons';

/** Identifier of a step in `tx-stepper`: a string or a number. */
export type TxStepValue = string | number;

/** Parts of `tx-stepper` that `pt` can style. */
export type TxStepperPart = 'root' | 'list' | 'step' | 'header' | 'number' | 'title' | 'separator' | 'panels' | 'panel' | 'item';

/** Context of the `txStepContent` template of a step. */
export interface TxStepContentContext {
  /** Value of the step. */
  $implicit: TxStepValue;
  /** Value of the step. */
  value: TxStepValue;
  /** Position of the step. */
  index: number;
  /** Whether the step is the active one. */
  active: boolean;
  /** Whether the step comes before the active one. */
  completed: boolean;
  /** Whether the step cannot be picked. */
  disabled: boolean;
  /** Makes the step with the given value active. */
  activate: (value: TxStepValue) => void;
}

/** Context of the `txStepPanelContent` template of a panel. */
export interface TxStepPanelContext {
  /** Function that makes the step with a given value active. */
  $implicit: (value: TxStepValue) => void;
  /** Makes the step with the given value active. */
  activate: (value: TxStepValue) => void;
  /** Value of the step the panel belongs to. */
  value: TxStepValue;
  /** Position of the step the panel belongs to. */
  index: number;
  /** Whether the panel is the open one. */
  active: boolean;
}

/**
 * Look of `tx-steps`: `default` (numbers above the labels) or `track` (markers with labels and
 * descriptions).
 */
export type TxStepsVariant = 'default' | 'track';

/** Parts of `tx-steps` that `pt` can style. */
export type TxStepsPart = 'root' | 'list' | 'item' | 'link' | 'number' | 'label' | 'description' | 'line';

/** Payload passed to the `command` of a `tx-steps` item when its step is clicked. */
export interface TxStepsCommandEvent {
  /** The click event. */
  originalEvent: Event;
  /** The clicked item. */
  item: TxStepsItem;
  /** Position of the clicked item. */
  index: number;
}

/** One step of `tx-steps`: a label, an optional icon and description, and a command. */
export interface TxStepsItem {
  /** Text of the step. */
  label: string;
  /** Icon shown in the step marker. */
  icon?: TxIconName | (string & {});
  /** Second line under the label; shown by the `track` variant. */
  description?: string;
  /** The step cannot be clicked. */
  disabled?: boolean;
  /** Runs when the step is clicked, while `readonly` is off. */
  command?: (event: TxStepsCommandEvent) => void;
}

/** Context of the `txStepsItem` template. */
export interface TxStepsItemContext {
  /** The item being rendered. */
  $implicit: TxStepsItem;
  /** Position of the item. */
  index: number;
  /** Whether the item is the current step. */
  active: boolean;
  /** Whether the item comes before the current step. */
  done: boolean;
}
