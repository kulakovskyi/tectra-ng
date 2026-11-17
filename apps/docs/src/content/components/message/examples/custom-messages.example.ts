import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxFieldError } from '@tectra-ng/ui/message';

const TAKEN = ['admin', 'support'];

function notTaken(control: AbstractControl): ValidationErrors | null {
  return TAKEN.includes(String(control.value).toLowerCase())
    ? { taken: { message: 'This name is already taken' } }
    : null;
}

function noSpaces(control: AbstractControl): ValidationErrors | null {
  return /\s/.test(String(control.value ?? '')) ? { spaces: true } : null;
}

@Component({
  selector: 'message-custom-messages-example',
  imports: [ReactiveFormsModule, TxLabel, TxInput, TxFieldError],
  template: `
    <div class="field">
      <tx-label for="custom-name">Team name</tx-label>
      <input
        txInput
        id="custom-name"
        [formControl]="name"
        placeholder="Try “admin”, one letter or a space"
        [fluid]="true"
      />
      <tx-field-error for="custom-name" [control]="name" [messages]="messages" />
    </div>
  `,
  styles: `
    .field {
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MessageCustomMessagesExample {
  readonly name = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    notTaken,
    noSpaces,
  ]);
  readonly messages = {
    required: 'Give your team a name',
    minlength: (error: unknown) => `Add ${this.missing(error)} more`,
    '*': 'Use letters, digits and dashes only',
  };

  private missing(error: unknown): number {
    const { requiredLength, actualLength } = error as {
      requiredLength: number;
      actualLength: number;
    };
    return requiredLength - actualLength;
  }
}
