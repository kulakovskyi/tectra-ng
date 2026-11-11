import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxTextarea } from '@tectra-ng/ui/textarea';
import { TxFormValidation } from '@tectra-ng/utils/form-validation';

@Component({
  selector: 'form-validation-basic-example',
  imports: [ReactiveFormsModule, TxButton, TxDatePicker, TxField, TxInput, TxSelect, TxTextarea],
  providers: [TxFormValidation],
  template: `
    <form class="form" [formGroup]="form">
      <tx-field label="Title" [control]="form.controls.title">
        <input txInput formControlName="title" [fluid]="true" />
      </tx-field>
      <tx-field label="Description" [control]="form.controls.description">
        <textarea txTextarea rows="4" formControlName="description" [fluid]="true"></textarea>
      </tx-field>
      <tx-field label="Priority" [control]="form.controls.priority">
        <tx-select formControlName="priority" placeholder="Choose" [options]="priorities" />
      </tx-field>
      <tx-field label="Due date" [control]="form.controls.due">
        <tx-datepicker formControlName="due" [showIcon]="true" [fluid]="true" />
      </tx-field>
      <div class="flex">
        <button txButton type="button" label="Save" (click)="save()"></button>
        <span class="hint">{{ status() }}</span>
      </div>
    </form>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 400px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FormValidationBasicExample {
  private readonly validation = inject(TxFormValidation);

  readonly priorities = ['Low', 'Medium', 'High'];
  readonly status = signal('');
  readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: Validators.required }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(20)],
    }),
    priority: new FormControl<string | null>(null, Validators.required),
    due: new FormControl<Date | null>(null, Validators.required),
  });

  save(): void {
    if (this.validation.scrollToFirstInvalid(this.form)) {
      this.status.set('Fix the highlighted fields.');
      return;
    }
    this.status.set('Saved.');
  }
}
