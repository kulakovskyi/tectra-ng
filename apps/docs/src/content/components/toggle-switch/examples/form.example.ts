import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'toggle-switch-form-example',
  imports: [ReactiveFormsModule, TxField, TxToggleSwitch, TxButton],
  template: `
    <div class="form">
      <tx-field [messages]="{ required: 'Confirm the backup before deleting' }">
        <tx-toggle-switch label="I have downloaded a backup" [formControl]="confirmed" />
      </tx-field>
      <button txButton severity="danger" (click)="confirmed.markAsTouched()">Delete project</button>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleSwitchFormExample {
  readonly confirmed = new FormControl(false, Validators.requiredTrue);
}
