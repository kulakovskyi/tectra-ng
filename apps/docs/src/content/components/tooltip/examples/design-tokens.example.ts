import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

@Component({
  selector: 'tooltip-design-tokens-example',
  imports: [TxTooltip, TxButton],
  template: `
    <button
      txButton
      severity="secondary"
      [outlined]="true"
      txTooltip="A wider, roomier tooltip in the accent colour with a bigger arrow"
      [tooltipDt]="{
        root: {
          background: 'var(--tx-primary-base)',
          color: 'var(--tx-primary-contrast)',
          maxWidth: '200px',
          padding: '10px 14px',
          borderRadius: 'var(--tx-radius-lg)',
        },
        arrow: { size: '12px' },
      }"
    >
      Custom tooltip
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipDesignTokensExample {}
