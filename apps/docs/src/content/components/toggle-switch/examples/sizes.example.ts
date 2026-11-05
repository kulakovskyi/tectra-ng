import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxToggleSwitch } from '@tectra/ui/toggle-switch';

@Component({
  selector: 'toggle-switch-sizes-example',
  imports: [TxToggleSwitch],
  template: `
    <div class="row">
      <tx-toggle-switch size="small" label="Small" />
      <tx-toggle-switch label="Medium" />
      <tx-toggle-switch size="large" label="Large" />
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
export default class ToggleSwitchSizesExample {}
