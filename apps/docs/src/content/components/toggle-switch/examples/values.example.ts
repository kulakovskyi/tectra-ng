import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxToggleSwitch } from '@tectra/ui/toggle-switch';

@Component({
  selector: 'toggle-switch-values-example',
  imports: [FormsModule, TxToggleSwitch],
  template: `
    <tx-toggle-switch
      label="Site is live"
      trueValue="published"
      falseValue="draft"
      [(ngModel)]="status"
    />
    <p class="hint">Value: {{ status }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleSwitchValuesExample {
  status = 'draft';
}
