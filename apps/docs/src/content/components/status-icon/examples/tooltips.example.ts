import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatusIcon } from '@tectra-ng/ui/status-icon';

@Component({
  selector: 'status-icon-tooltips-example',
  imports: [TxStatusIcon],
  template: `
    <div class="row">
      <tx-status-icon [status]="true" label="Backups are on" tooltip />
      <tx-status-icon
        severity="warn"
        label="Certificate expires in 5 days"
        tooltip
        tooltipPlacement="right"
      />
      <tx-status-icon [status]="false" label="Two-factor sign-in is off" tooltip="none" />
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
export default class StatusIconTooltipsExample {}
