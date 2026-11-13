import { InjectionToken, Provider } from '@angular/core';
import { TxTooltipOptions } from './tooltip.types';

/** Built-in defaults of the tooltip options, used where nothing else is set. */
export const TX_TOOLTIP_DEFAULTS = {
  placement: 'top',
  event: 'both',
  showDelay: 0,
  hideDelay: 0,
  offset: 3.5,
  arrow: true,
  interactive: false,
} as const satisfies TxTooltipOptions;

/** App-wide tooltip options; set with `provideTxTooltip`. */
export const TX_TOOLTIP_OPTIONS = new InjectionToken<TxTooltipOptions>('TX_TOOLTIP_OPTIONS');

/** Sets app-wide defaults of every `txTooltip`, e.g. `provideTxTooltip({ showDelay: 300 })`. */
export function provideTxTooltip(options: TxTooltipOptions): Provider {
  return { provide: TX_TOOLTIP_OPTIONS, useValue: options };
}
