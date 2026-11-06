import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

@Component({
  selector: 'tooltip-basic-example',
  imports: [TxTooltip, TxButton],
  template: `
    <div class="row">
      <button
        txButton
        severity="secondary"
        [outlined]="true"
        txTooltip="Saves a draft you can finish later"
      >
        Save draft
      </button>
      <button txButton txTooltip="Sends the invoice to the customer">Send invoice</button>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipBasicExample {}
