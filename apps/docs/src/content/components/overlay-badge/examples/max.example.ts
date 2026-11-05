import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra/icons';
import { TxOverlayBadge } from '@tectra/ui/overlay-badge';

@Component({
  selector: 'overlay-badge-max-example',
  imports: [TxOverlayBadge, TxIcon],
  template: `
    <div class="row">
      <tx-overlay-badge [value]="8" [max]="99"
        ><tx-icon name="bell" class="icon"
      /></tx-overlay-badge>
      <tx-overlay-badge [value]="120" [max]="99"
        ><tx-icon name="bell" class="icon"
      /></tx-overlay-badge>
      <tx-overlay-badge [value]="1500" [max]="999"
        ><tx-icon name="bell" class="icon"
      /></tx-overlay-badge>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 36px;
    }

    .icon {
      font-size: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OverlayBadgeMaxExample {}
