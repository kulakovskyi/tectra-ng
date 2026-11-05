import { InjectionToken, Provider } from '@angular/core';
import { TxTooltipOptions } from './tooltip.types';

export const TX_TOOLTIP_DEFAULTS = {
  placement: 'top',
  event: 'both',
  showDelay: 0,
  hideDelay: 0,
  offset: 3.5,
  arrow: true,
  interactive: false,
} as const satisfies TxTooltipOptions;

export const TX_TOOLTIP_OPTIONS = new InjectionToken<TxTooltipOptions>('TX_TOOLTIP_OPTIONS');

export function provideTxTooltip(options: TxTooltipOptions): Provider {
  return { provide: TX_TOOLTIP_OPTIONS, useValue: options };
}
