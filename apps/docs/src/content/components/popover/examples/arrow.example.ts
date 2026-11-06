import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPlacement } from '@tectra-ng/core/overlay';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';

@Component({
  selector: 'popover-arrow-example',
  imports: [TxPopover, TxPopoverTrigger, TxButton],
  template: `
    <div class="row">
      @for (placement of placements; track placement) {
        <button txButton severity="secondary" [outlined]="true" [txPopoverTrigger]="pop">
          {{ placement }}
        </button>
        <tx-popover #pop arrow [placement]="placement" [ariaLabel]="'Popover on the ' + placement">
          Opens on the <strong>{{ placement }}</strong> side and flips when there is no room.
        </tx-popover>
      }
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
export default class PopoverArrowExample {
  readonly placements: TxPlacement[] = ['top', 'right', 'bottom', 'left'];
}
