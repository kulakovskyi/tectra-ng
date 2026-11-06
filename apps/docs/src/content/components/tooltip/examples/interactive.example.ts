import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

@Component({
  selector: 'tooltip-interactive-example',
  imports: [TxTooltip],
  template: `
    <dl class="details">
      <dt>Order</dt>
      <dd>
        <button
          type="button"
          class="value"
          txTooltip="ord_8F2KQ1-7731-4c0e-9d1a-58b2a4c0f6e3"
          [tooltipInteractive]="true"
        >
          ord_8F2KQ1…
        </button>
      </dd>
      <dt>Status</dt>
      <dd>
        <button type="button" class="value" txTooltip="Paid on 4 November, 14:32">Paid</button>
      </dd>
    </dl>
  `,
  styles: `
    .details {
      display: grid;
      grid-template-columns: max-content max-content;
      gap: 8px 24px;
      margin: 0;
    }
    dt {
      color: var(--tx-text-muted);
    }
    dd {
      margin: 0;
    }
    .value {
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      cursor: default;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipInteractiveExample {}
