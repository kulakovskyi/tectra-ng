import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxEmailSuggestion } from '@tectra-ng/ui/email-suggestion';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'email-suggestion-basic-example',
  imports: [TxEmailSuggestion, TxField, TxInput, ReactiveFormsModule],
  template: `
    <tx-field [label]="'Work email'">
      <input txInput type="email" autocomplete="off" [formControl]="email" />
    </tx-field>
    <tx-email-suggestion
      [value]="typed()"
      [domain]="'example.com'"
      (applied)="email.setValue($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EmailSuggestionBasicExample {
  readonly email = new FormControl('');
  readonly typed = toSignal(this.email.valueChanges, { initialValue: '' });
}
