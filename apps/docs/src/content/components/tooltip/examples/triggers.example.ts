import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

@Component({
  selector: 'tooltip-triggers-example',
  imports: [TxTooltip, TxButton, TxInput],
  template: `
    <div class="row">
      <button txButton severity="secondary" [outlined]="true" txTooltip="Hover or Tab here">
        Hover and focus
      </button>
      <button
        txButton
        severity="secondary"
        [outlined]="true"
        txTooltip="Only the pointer opens this one"
        tooltipEvent="hover"
      >
        Hover only
      </button>
      <input
        txInput
        aria-label="Username"
        placeholder="Username"
        txTooltip="3–20 letters, digits or dashes"
        tooltipEvent="focus"
        tooltipPlacement="right"
      />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipTriggersExample {}
