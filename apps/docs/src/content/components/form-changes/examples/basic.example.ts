import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxSelect } from '@tectra-ng/ui/select';
import { trackFormChanges } from '@tectra-ng/utils/form-changes';

@Component({
  selector: 'form-changes-basic-example',
  imports: [ReactiveFormsModule, TxButton, TxField, TxInput, TxSelect],
  template: `
    <form class="form" [formGroup]="form">
      <tx-field label="Workspace name">
        <input txInput formControlName="name" [fluid]="true" />
      </tx-field>
      <tx-field label="Region">
        <tx-select formControlName="region" [options]="regions" />
      </tx-field>
      <div class="flex">
        <button
          txButton
          type="button"
          label="Save"
          [disabled]="!changes.changed()"
          (click)="changes.commit()"
        ></button>
        <button
          txButton
          type="button"
          label="Revert"
          severity="secondary"
          [disabled]="!changes.changed()"
          (click)="changes.revert()"
        ></button>
        <span class="hint">{{ changes.changed() ? 'Unsaved changes' : 'All saved' }}</span>
      </div>
    </form>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FormChangesBasicExample {
  readonly regions = ['Europe', 'North America', 'Asia'];
  readonly form = new FormGroup({
    name: new FormControl('Northwind'),
    region: new FormControl('Europe'),
  });
  readonly changes = trackFormChanges(this.form);
}
