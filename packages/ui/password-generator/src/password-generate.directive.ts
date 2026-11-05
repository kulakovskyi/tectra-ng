import { Directive, booleanAttribute, inject, input, output } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { optionalNumber } from '@tectra/core/utils';
import { TxPassword } from '@tectra/ui/password';
import { TxPasswordGenerator } from './password-generator.service';

@Directive({
  selector: 'button[txPasswordGenerate]',
  host: {
    type: 'button',
    '(click)': 'generate()',
  },
})
export class TxPasswordGenerate {
  private generator = inject(TxPasswordGenerator);

  readonly target = input<TxPassword | AbstractControl | null | undefined>(undefined, { alias: 'txPasswordGenerate' });
  readonly length = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly lowercase = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly uppercase = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly digits = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly symbols = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly excludeSimilar = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly reveal = input<boolean, unknown>(true, { transform: booleanAttribute });

  readonly generated = output<string>();

  generate(): string {
    const password = this.generator.generate({
      length: this.length(),
      lowercase: this.lowercase(),
      uppercase: this.uppercase(),
      digits: this.digits(),
      symbols: this.symbols(),
      excludeSimilar: this.excludeSimilar(),
    });
    const target = this.target();
    if (target instanceof TxPassword) {
      target.fill(password, this.reveal());
    } else if (target) {
      target.setValue(password);
      target.markAsDirty();
    }
    this.generated.emit(password);
    return password;
  }
}
