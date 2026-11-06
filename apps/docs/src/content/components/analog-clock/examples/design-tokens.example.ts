import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAnalogClock } from '@tectra-ng/ui/analog-clock';

@Component({
  selector: 'analog-clock-design-tokens-example',
  imports: [TxAnalogClock],
  template: `
    <tx-analog-clock
      ariaLabel="Dark face"
      [showSeconds]="true"
      [dt]="{
        root: {
          size: '160px',
          background: 'var(--tx-surface-900)',
          borderColor: 'var(--tx-surface-700)',
        },
        tick: { majorColor: 'var(--tx-surface-0)', color: 'var(--tx-surface-600)' },
        hourHand: { color: 'var(--tx-surface-0)' },
        minuteHand: { color: 'var(--tx-success-base)' },
        pin: { color: 'var(--tx-success-base)', ringColor: 'var(--tx-surface-900)' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalogClockDesignTokensExample {}
