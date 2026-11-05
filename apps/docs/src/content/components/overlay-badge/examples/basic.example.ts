import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxOverlayBadge } from '@tectra/ui/overlay-badge';

@Component({
  selector: 'overlay-badge-basic-example',
  imports: [TxOverlayBadge, TxButton],
  template: `
    <div class="row">
      <tx-overlay-badge [value]="unread()" ariaLabel="unread messages">
        <button
          txButton
          icon="envelope"
          severity="secondary"
          [text]="true"
          aria-label="Inbox"
        ></button>
      </tx-overlay-badge>
      <tx-overlay-badge value="New" severity="primary">
        <button txButton severity="secondary" [outlined]="true">Reports</button>
      </tx-overlay-badge>
      <button txButton size="small" [text]="true" (click)="unread.set(unread() + 1)">
        Add message
      </button>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 28px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OverlayBadgeBasicExample {
  readonly unread = signal(4);
}
