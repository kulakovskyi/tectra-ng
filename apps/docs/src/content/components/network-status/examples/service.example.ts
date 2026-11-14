import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxCookieNotice } from '@tectra-ng/blocks/cookie-notice';
import { TxNetworkService, TxNetworkStatus } from '@tectra-ng/blocks/network-status';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTag } from '@tectra-ng/ui/tag';

@Component({
  selector: 'network-status-service-example',
  imports: [TxCookieNotice, TxNetworkStatus, TxButton, TxTag],
  providers: [TxNetworkService],
  template: `
    <div class="screen">
      <div class="actions">
        <button txButton severity="secondary" outlined icon="times" (click)="network.markOffline()">
          Requests failed
        </button>
        <button txButton severity="secondary" outlined icon="check" (click)="network.markOnline()">
          Requests work again
        </button>
        <tx-tag
          [value]="network.status()"
          [severity]="network.status() === 'offline' ? 'danger' : 'success'"
        />
      </div>
      <tx-cookie-notice cookieName="docs-cookie-network" preview />
      <tx-network-status bodyClass="" />
    </div>
  `,
  styles: `
    .screen {
      width: 100%;
      height: 320px;
      padding: 18px;
      box-sizing: border-box;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
      background: var(--tx-surface-ground);
      contain: layout;
      overflow: hidden;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NetworkStatusServiceExample {
  readonly network = inject(TxNetworkService);
}
