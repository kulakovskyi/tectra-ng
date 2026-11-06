import { TemplateRef } from '@angular/core';
import { TxPlacement } from '@tectra-ng/core/overlay';

export type TxTooltipEvent = 'hover' | 'focus' | 'both' | 'manual';
export type TxTooltipPart = 'root' | 'content' | 'arrow';

export interface TxTooltipContext<TData = unknown> {
  $implicit: TData;
  close: () => void;
}

export type TxTooltipContent = string | number | TemplateRef<TxTooltipContext> | null | undefined;

export interface TxTooltipOptions {
  placement?: TxPlacement;
  event?: TxTooltipEvent;
  showDelay?: number;
  hideDelay?: number;
  life?: number;
  offset?: number;
  arrow?: boolean;
  interactive?: boolean;
}
