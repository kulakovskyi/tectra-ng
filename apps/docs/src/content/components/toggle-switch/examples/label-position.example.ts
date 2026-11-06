import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'toggle-switch-label-position-example',
  imports: [TxToggleSwitch],
  template: `
    <div class="row">
      <tx-toggle-switch label="Label after" />
      <tx-toggle-switch label="Label before" labelPosition="start" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleSwitchLabelPositionExample {}
