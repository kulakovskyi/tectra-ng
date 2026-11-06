import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatusIcon } from '@tectra-ng/ui/status-icon';

@Component({
  selector: 'status-icon-severities-example',
  imports: [TxStatusIcon],
  template: `
    <div class="row">
      <tx-status-icon severity="success" label="Healthy" />
      <tx-status-icon severity="info" label="Updating" />
      <tx-status-icon severity="warn" label="Expires soon" />
      <tx-status-icon severity="danger" label="Down" />
      <tx-status-icon severity="secondary" label="Paused" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatusIconSeveritiesExample {}
