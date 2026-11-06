import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

@Component({
  selector: 'tooltip-delays-example',
  imports: [TxTooltip, TxButton],
  template: `
    <div class="row">
      <button
        txButton
        severity="secondary"
        [outlined]="true"
        txTooltip="Right away"
        [tooltipShowDelay]="0"
      >
        No delay
      </button>
      <button
        txButton
        severity="secondary"
        [outlined]="true"
        txTooltip="After a second"
        [tooltipShowDelay]="1000"
      >
        1 s to show
      </button>
      <button
        txButton
        severity="secondary"
        [outlined]="true"
        txTooltip="Stays for a second after you leave"
        [tooltipHideDelay]="1000"
      >
        1 s to hide
      </button>
      <button
        txButton
        severity="secondary"
        [outlined]="true"
        txTooltip="Gone in two seconds"
        [tooltipLife]="2000"
      >
        2 s life
      </button>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipDelaysExample {}
