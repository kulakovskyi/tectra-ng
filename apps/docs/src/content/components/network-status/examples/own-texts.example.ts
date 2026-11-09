import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxNetworkStatus } from '@tectra-ng/blocks/network-status';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'network-status-own-texts-example',
  imports: [TxNetworkStatus, TxButton],
  template: `
    <div class="screen">
      <div class="actions">
        <button txButton severity="secondary" outlined icon="wifi" (click)="status.onOffline()">
          Go offline
        </button>
        <button txButton severity="secondary" outlined icon="check" (click)="status.onOnline()">
          Back online
        </button>
      </div>
      <tx-network-status
        #status
        bodyClass=""
        offlineText="You are offline — changes stay on this device"
        restoredText="Back online — syncing your changes"
        [restoredDuration]="5000"
      />
    </div>
  `,
  styles: `
    .screen {
      width: 100%;
      height: 220px;
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
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NetworkStatusOwnTextsExample {}
