import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTopbarPreferences } from '@tectra-ng/blocks/topbar-preferences';

@Component({
  selector: 'topbar-preferences-basic-example',
  imports: [TxTopbarPreferences],
  template: `
    <div class="bars">
      <div class="bar">
        <strong>Plain</strong>
        <tx-topbar-preferences />
      </div>
      <div class="bar">
        <strong>Raised</strong>
        <tx-topbar-preferences raised />
      </div>
    </div>
  `,
  styles: `
    .bars {
      display: flex;
      flex-direction: column;
      gap: 14px;
      width: 100%;
    }

    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 10.5px 14px;
      border-radius: var(--tx-radius-lg);
      background: var(--tx-surface-card);
      box-shadow: 0 0 0 1px var(--tx-surface-border);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TopbarPreferencesBasicExample {}
