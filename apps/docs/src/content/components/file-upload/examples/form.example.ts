import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxFileUpload } from '@tectra-ng/ui/file-upload';

@Component({
  selector: 'file-upload-form-example',
  imports: [ReactiveFormsModule, TxField, TxFileUpload, TxButton],
  template: `
    <div class="form">
      <tx-field
        label="Contract"
        [required]="true"
        [messages]="{ required: 'Attach the signed contract' }"
      >
        <tx-file-upload accept=".pdf" description="Signed PDF" [formControl]="contract" />
      </tx-field>
      <div class="actions">
        <button txButton (click)="contract.markAsTouched()">Send</button>
        <span class="note">{{ contract.value ? contract.value.name : 'No file yet' }}</span>
      </div>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      gap: 16px;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileUploadFormExample {
  readonly contract = new FormControl<File | null>(null, Validators.required);
}
