import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxOverlayBadge } from '@tectra-ng/ui/overlay-badge';

@Component({
  selector: 'overlay-badge-avatar-example',
  imports: [TxOverlayBadge],
  template: `
    <div class="row">
      <tx-overlay-badge shape="circle" severity="success" ariaLabel="online"
        ><span class="face">OK</span></tx-overlay-badge
      >
      <tx-overlay-badge shape="circle" [value]="5"><span class="face">TS</span></tx-overlay-badge>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 32px;
    }

    .face {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--tx-highlight-background);
      color: var(--tx-highlight-color);
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OverlayBadgeAvatarExample {}
