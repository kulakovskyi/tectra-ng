import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatusIcon } from '@tectra-ng/ui/status-icon';

@Component({
  selector: 'status-icon-labels-example',
  imports: [TxStatusIcon],
  template: `
    <div class="row">
      <tx-status-icon [status]="true" label="Email verified" />
      <tx-status-icon [status]="false" label="Phone not verified" />
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
export default class StatusIconLabelsExample {}
