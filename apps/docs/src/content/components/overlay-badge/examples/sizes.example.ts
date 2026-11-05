import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra/icons';
import { TxOverlayBadge } from '@tectra/ui/overlay-badge';

@Component({
  selector: 'overlay-badge-sizes-example',
  imports: [TxOverlayBadge, TxIcon],
  template: `
    <div class="row">
      <tx-overlay-badge [value]="2" size="small"
        ><tx-icon name="bell" class="small"
      /></tx-overlay-badge>
      <tx-overlay-badge [value]="2"><tx-icon name="bell" class="medium" /></tx-overlay-badge>
      <tx-overlay-badge [value]="2" size="large"
        ><tx-icon name="bell" class="large"
      /></tx-overlay-badge>
      <tx-overlay-badge [value]="2" size="xlarge"
        ><tx-icon name="bell" class="xlarge"
      /></tx-overlay-badge>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 36px;
    }

    .small {
      font-size: 18px;
    }

    .medium {
      font-size: 24px;
    }

    .large {
      font-size: 30px;
    }

    .xlarge {
      font-size: 38px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OverlayBadgeSizesExample {}
