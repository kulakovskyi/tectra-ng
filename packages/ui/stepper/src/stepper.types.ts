import { TxIconName } from '@tectra-ng/icons';

export type TxStepValue = string | number;

export type TxStepperPart = 'root' | 'list' | 'step' | 'header' | 'number' | 'title' | 'separator' | 'panels' | 'panel' | 'item';

export interface TxStepContentContext {
  $implicit: TxStepValue;
  value: TxStepValue;
  index: number;
  active: boolean;
  completed: boolean;
  disabled: boolean;
  activate: (value: TxStepValue) => void;
}

export interface TxStepPanelContext {
  $implicit: (value: TxStepValue) => void;
  activate: (value: TxStepValue) => void;
  value: TxStepValue;
  index: number;
  active: boolean;
}

export type TxStepsVariant = 'default' | 'track';

export type TxStepsPart = 'root' | 'list' | 'item' | 'link' | 'number' | 'label' | 'description' | 'line';

export interface TxStepsCommandEvent {
  originalEvent: Event;
  item: TxStepsItem;
  index: number;
}

export interface TxStepsItem {
  label: string;
  icon?: TxIconName | (string & {});
  description?: string;
  disabled?: boolean;
  command?: (event: TxStepsCommandEvent) => void;
}

export interface TxStepsItemContext {
  $implicit: TxStepsItem;
  index: number;
  active: boolean;
  done: boolean;
}
