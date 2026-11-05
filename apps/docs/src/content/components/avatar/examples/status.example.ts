import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar } from '@tectra/ui/avatar';
import { TxOverlayBadge } from '@tectra/ui/overlay-badge';

@Component({
  selector: 'avatar-status-example',
  imports: [TxAvatar, TxOverlayBadge],
  template: `
    <div class="row">
      <tx-overlay-badge shape="circle" severity="success" ariaLabel="online"
        ><tx-avatar name="Olena Kovalenko" size="large"
      /></tx-overlay-badge>
      <tx-overlay-badge shape="circle" severity="secondary" ariaLabel="away"
        ><tx-avatar name="Taras Shevchuk" size="large"
      /></tx-overlay-badge>
      <tx-overlay-badge shape="circle" [value]="3" ariaLabel="unread messages"
        ><tx-avatar name="Iryna Bondar" size="large"
      /></tx-overlay-badge>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AvatarStatusExample {}
