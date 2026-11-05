import { InjectionToken, Provider } from '@angular/core';
import { TxTooltipOptions } from './tooltip.types';

export const TX_TOOLTIP_DEFAULTS = {
  placement: 'top',
  event: 'both',
  showDelay: 250,
  hideDelay: 100,
  offset: 8,
  arrow: true,
  interactive: true,
} as const satisfies TxTooltipOptions;

export const TX_TOOLTIP_OPTIONS = new InjectionToken<TxTooltipOptions>('TX_TOOLTIP_OPTIONS');

export function provideTxTooltip(options: TxTooltipOptions): Provider {
  return { provide: TX_TOOLTIP_OPTIONS, useValue: options };
}
