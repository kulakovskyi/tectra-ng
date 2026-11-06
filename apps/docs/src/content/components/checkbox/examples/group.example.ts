import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxCheckbox, TxCheckboxGroup } from '@tectra-ng/ui/checkbox';

@Component({
  selector: 'checkbox-group-example',
  imports: [ReactiveFormsModule, JsonPipe, TxCheckbox, TxCheckboxGroup],
  template: `
    <div class="columns">
      <tx-checkbox-group [formControl]="permissions" [selectAll]="true" ariaLabel="Permissions">
        <tx-checkbox value="view" label="View pages" />
        <tx-checkbox value="edit" label="Edit pages" />
        <tx-checkbox value="publish" label="Publish" />
        <tx-checkbox value="billing" label="Manage billing" />
      </tx-checkbox-group>
      <tx-checkbox-group [formControl]="channels" orientation="horizontal" ariaLabel="Channels">
        <tx-checkbox value="email" label="Email" />
        <tx-checkbox value="sms" label="SMS" />
        <tx-checkbox value="push" label="Push" />
      </tx-checkbox-group>
    </div>
    <p class="hint">{{ permissions.value | json }} · {{ channels.value | json }}</p>
  `,
  styles: `
    .columns {
      display: flex;
      flex-wrap: wrap;
      gap: 48px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxGroupExample {
  readonly permissions = new FormControl<string[]>(['view']);
  readonly channels = new FormControl<string[]>(['email', 'push']);
}
