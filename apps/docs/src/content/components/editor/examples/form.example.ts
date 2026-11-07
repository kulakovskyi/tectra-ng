import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxEditor } from '@tectra-ng/editor';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';

@Component({
  selector: 'editor-form-example',
  imports: [ReactiveFormsModule, TxEditor, TxField, TxButton],
  template: `
    <div class="form">
      <tx-field
        label="Task description"
        [required]="true"
        [messages]="{ required: 'Describe the task' }"
      >
        <tx-editor
          toolbar="compact"
          placeholder="What needs to be done?"
          height="160px"
          [formControl]="description"
        />
      </tx-field>
      <button txButton (click)="description.markAsTouched()">Create task</button>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 16px;
    }

    tx-field {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorFormExample {
  readonly description = new FormControl('', {
    nonNullable: true,
    validators: Validators.required,
  });
}
