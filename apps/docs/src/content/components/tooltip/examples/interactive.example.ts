import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

@Component({
  selector: 'tooltip-interactive-example',
  imports: [TxTooltip, TxButton],
  template: `
    <dl class="details">
      <dt>Order</dt>
      <dd>
        <button
          txButton
          variant="link"
          size="small"
          txTooltip="ord_8F2KQ1-7731-4c0e-9d1a-58b2a4c0f6e3"
          [tooltipInteractive]="true"
        >
          ord_8F2KQ1…
        </button>
      </dd>
      <dt>Status</dt>
      <dd>
        <button txButton variant="link" size="small" txTooltip="Paid on 4 November, 14:32">
          Paid
        </button>
      </dd>
    </dl>
  `,
  styles: `
    .details {
      display: grid;
      grid-template-columns: max-content max-content;
      align-items: center;
      gap: 8px 24px;
      margin: 0;
    }
    dt {
      color: var(--tx-text-muted);
    }
    dd {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipInteractiveExample {}
