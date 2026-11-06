import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxTextarea } from '@tectra-ng/ui/textarea';

@Component({
  selector: 'textarea-form-example',
  imports: [ReactiveFormsModule, TxField, TxTextarea, TxButton],
  template: `
    <div class="form">
      <tx-field label="Feedback" [required]="true" hint="At least 20 characters.">
        <textarea
          txTextarea
          rows="3"
          [autoResize]="true"
          [formControl]="feedback"
          [fluid]="true"
        ></textarea>
      </tx-field>
      <button txButton (click)="feedback.markAsTouched()">Send</button>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 16px;
      max-width: 420px;
    }

    tx-field {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TextareaFormExample {
  readonly feedback = new FormControl('', [Validators.required, Validators.minLength(20)]);
}
