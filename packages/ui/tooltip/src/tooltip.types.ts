import { TemplateRef } from '@angular/core';
import { TxPlacement } from '@tectra-ng/core/overlay';

/** What opens the tooltip: pointer hover, keyboard focus, both, or only the API. */
export type TxTooltipEvent = 'hover' | 'focus' | 'both' | 'manual';
/** Parts of `tx-tooltip` that `pt` can style. */
export type TxTooltipPart = 'root' | 'content' | 'arrow';

/** Context of a template tooltip. */
export interface TxTooltipContext<TData = unknown> {
  /** Value of the `tooltipContext` input. */
  $implicit: TData;
  /** Closes the tooltip. */
  close: () => void;
}

/** Content of a tooltip: text, a number, a template, or nothing to keep it hidden. */
export type TxTooltipContent = string | number | TemplateRef<TxTooltipContext> | null | undefined;

/** App-wide defaults of `txTooltip`; each can be overridden per element. */
export interface TxTooltipOptions {
  /** Side of the element where the tooltip opens (default `top`). */
  placement?: TxPlacement;
  /** What opens the tooltip (default `both`). */
  event?: TxTooltipEvent;
  /** Delay before the tooltip opens, in ms (default 0). */
  showDelay?: number;
  /** Delay before the tooltip closes, in ms (default 0). */
  hideDelay?: number;
  /** Closes the tooltip after this many ms; without it the tooltip stays while triggered. */
  life?: number;
  /** Gap between the element and the tooltip, in px (default 3.5). */
  offset?: number;
  /** Shows the arrow that points at the element (default `true`). */
  arrow?: boolean;
  /** Lets the pointer move onto the tooltip without closing it (default `false`). */
  interactive?: boolean;
}
