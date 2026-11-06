import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatusIcon } from '@tectra-ng/ui/status-icon';

@Component({
  selector: 'status-icon-sizes-example',
  imports: [TxStatusIcon],
  template: `
    <div class="row">
      <tx-status-icon [status]="true" size="small" />
      <tx-status-icon [status]="true" />
      <tx-status-icon [status]="true" size="large" />
      <tx-status-icon severity="info" icon="star-fill" label="Starred" size="large" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatusIconSizesExample {}
