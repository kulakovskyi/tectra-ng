import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxOverlayBadge } from '@tectra-ng/ui/overlay-badge';

@Component({
  selector: 'overlay-badge-design-tokens-example',
  imports: [TxOverlayBadge, TxIcon],
  template: `<tx-overlay-badge [value]="9" [dt]="{ root: { ringWidth: '3px', offset: '4px' } }"
    ><tx-icon name="bell" class="icon"
  /></tx-overlay-badge>`,
  styles: `
    .icon {
      font-size: 28px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OverlayBadgeDesignTokensExample {}
