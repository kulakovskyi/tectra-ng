import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxButton } from '@tectra/ui/button';
import { TxField } from '@tectra/ui/field';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'field-server-error-example',
  imports: [ReactiveFormsModule, TxField, TxInput, TxButton],
  template: `
    <div class="form">
      <tx-field label="Subdomain" hint="Try “docs” — it is taken." [errorText]="serverError()">
        <input
          txInput
          [formControl]="subdomain"
          [fluid]="true"
          (input)="serverError.set(undefined)"
        />
      </tx-field>
      <button txButton [loading]="isChecking()" (click)="check()">Check</button>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 16px;
      max-width: 360px;
    }

    tx-field {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldServerErrorExample {
  readonly subdomain = new FormControl('docs');
  readonly serverError = signal<string | undefined>(undefined);
  readonly isChecking = signal(false);

  check(): void {
    this.isChecking.set(true);
    setTimeout(() => {
      this.isChecking.set(false);
      this.serverError.set(
        this.subdomain.value === 'docs' ? 'This subdomain is already taken' : undefined,
      );
    }, 600);
  }
}
