import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra/icons';
import { TxOverlayBadge } from '@tectra/ui/overlay-badge';

@Component({
  selector: 'overlay-badge-dot-example',
  imports: [TxOverlayBadge, TxIcon],
  template: `
    <div class="row">
      <tx-overlay-badge ariaLabel="new updates"
        ><tx-icon name="cog" class="icon"
      /></tx-overlay-badge>
      <tx-overlay-badge severity="success"><tx-icon name="cloud" class="icon" /></tx-overlay-badge>
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
export default class OverlayBadgeDotExample {}
