import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'field-horizontal-example',
  imports: [ReactiveFormsModule, TxField, TxInput, TxSelect],
  template: `
    <form class="form" [formGroup]="form">
      <tx-field label="Display name" layout="horizontal">
        <input txInput formControlName="name" [fluid]="true" />
      </tx-field>
      <tx-field label="Time zone" layout="horizontal" hint="Used for reports and reminders.">
        <tx-select [options]="zones" formControlName="zone" />
      </tx-field>
    </form>
  `,
  styles: `
    .form {
      display: grid;
      gap: 16px;
      max-width: 560px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldHorizontalExample {
  readonly zones = [
    { label: 'Kyiv (UTC+2)', value: 'kyiv' },
    { label: 'London (UTC+0)', value: 'london' },
    { label: 'New York (UTC−5)', value: 'new-york' },
  ];
  readonly form = new FormGroup({
    name: new FormControl('Olena'),
    zone: new FormControl('kyiv'),
  });
}
