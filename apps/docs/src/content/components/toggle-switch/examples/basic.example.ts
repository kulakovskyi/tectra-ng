import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxToggleSwitch } from '@tectra/ui/toggle-switch';

@Component({
  selector: 'toggle-switch-basic-example',
  imports: [FormsModule, TxToggleSwitch],
  template: `
    <tx-toggle-switch label="Wi-Fi" [(ngModel)]="wifi" />
    <p class="hint">Value: {{ wifi }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleSwitchBasicExample {
  wifi = true;
}
