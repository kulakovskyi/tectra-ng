import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxToggleSwitch } from '@tectra/ui/toggle-switch';

@Component({
  selector: 'toggle-switch-handle-icons-example',
  imports: [TxToggleSwitch],
  template: `
    <div class="row">
      <tx-toggle-switch label="Notifications" onIcon="check" offIcon="times" />
      <tx-toggle-switch label="Lock editing" size="large" onIcon="lock" offIcon="lock-open" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 32px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleSwitchHandleIconsExample {}
