import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'toggle-switch-states-example',
  imports: [FormsModule, TxToggleSwitch],
  template: `
    <div class="row">
      <tx-toggle-switch label="Disabled" [disabled]="true" />
      <tx-toggle-switch label="Disabled, on" [disabled]="true" [ngModel]="true" />
      <tx-toggle-switch label="Read only" [readonly]="true" [ngModel]="true" />
      <tx-toggle-switch label="Invalid" [invalid]="true" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 28px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleSwitchStatesExample {}
