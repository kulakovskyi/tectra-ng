import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTopbarPreferences } from '@tectra-ng/blocks/topbar-preferences';

@Component({
  selector: 'topbar-preferences-stacked-example',
  imports: [TxTopbarPreferences],
  template: `
    <div class="panel">
      <tx-topbar-preferences layout="stacked" />
    </div>
  `,
  styles: `
    .panel {
      width: 100%;
      max-width: 280px;
      padding: 7px 14px;
      border-radius: var(--tx-radius-lg);
      background: var(--tx-surface-card);
      box-shadow: 0 0 0 1px var(--tx-surface-border);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TopbarPreferencesStackedExample {}
