import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxToggleButton } from '@tectra/ui/toggle-button';

@Component({
  selector: 'toggle-button-form-example',
  imports: [TxToggleButton, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-toggle-button
        [formControl]="notify"
        [onLabel]="'Email on'"
        [offLabel]="'Email off'"
        (changed)="clicks.update((n) => n + 1)"
      />
      <span class="hint">Value: {{ notify.value }} · changed {{ clicks() }} times</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleButtonFormExample {
  notify = new FormControl(true);
  clicks = signal(0);
}
