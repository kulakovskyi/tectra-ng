import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatusIcon } from '@tectra-ng/ui/status-icon';

@Component({
  selector: 'status-icon-basic-example',
  imports: [TxStatusIcon],
  template: `
    <div class="row">
      <tx-status-icon [status]="true" />
      <tx-status-icon [status]="false" />
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
export default class StatusIconBasicExample {}
