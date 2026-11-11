import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxStyleClass } from '@tectra-ng/utils/style-class';

@Component({
  selector: 'style-class-toggle-class-example',
  imports: [TxButton, TxStyleClass],
  template: `
    <div class="stack">
      <div>
        <button
          txButton
          label="Compact rows"
          severity="secondary"
          size="small"
          txStyleClass=".style-class-list"
          toggleClass="compact"
        ></button>
      </div>
      <div class="style-class-list">
        @for (item of items; track item) {
          <div class="row">{{ item }}</div>
        }
      </div>
    </div>
  `,
  styles: `
    .style-class-list {
      border: 1px solid var(--tx-surface-border);
      border-radius: var(--tx-radius-md);
    }
    .row {
      padding: 12px;
      border-bottom: 1px solid var(--tx-surface-border);
      transition: padding var(--tx-motion-duration) var(--tx-motion-easing);
    }
    .row:last-child {
      border-bottom: 0;
    }
    .compact .row {
      padding: 4px 12px;
    }
    @media (prefers-reduced-motion: reduce) {
      .row {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StyleClassToggleClassExample {
  readonly items = ['Invoices', 'Payments', 'Refunds', 'Payouts'];
}
