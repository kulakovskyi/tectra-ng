import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxOverlayBadge } from '@tectra-ng/ui/overlay-badge';

@Component({
  selector: 'overlay-badge-zero-example',
  imports: [TxOverlayBadge, TxIcon],
  template: `
    <div class="row">
      <tx-overlay-badge [value]="0"><tx-icon name="shopping-cart" class="icon" /></tx-overlay-badge>
      <tx-overlay-badge [value]="0" [showZero]="true" severity="secondary"
        ><tx-icon name="shopping-cart" class="icon"
      /></tx-overlay-badge>
      <tx-overlay-badge [value]="7" [hidden]="true"
        ><tx-icon name="shopping-cart" class="icon"
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
export default class OverlayBadgeZeroExample {}
