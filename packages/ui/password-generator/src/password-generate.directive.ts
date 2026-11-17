import { AfterViewInit, Directive, ElementRef, Renderer2, booleanAttribute, effect, inject, input, output, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalNumber } from '@tectra-ng/core/utils';
import { TxPassword } from '@tectra-ng/ui/password';
import { TxPasswordGenerator } from './password-generator.service';

const NAME_ATTRIBUTES = ['aria-label', 'aria-labelledby', 'title'];

/**
 * Generates a password on click and puts it into a `tx-password` or a form control. Works on any `button`, also
 * `txButton`; an icon-only button without its own name gets the translated "Generate password" as its accessible name.
 */
@Directive({
  selector: 'button[txPasswordGenerate]',
  host: {
    type: 'button',
    '(click)': 'generate()',
  },
})
export class TxPasswordGenerate implements AfterViewInit {
  private generator = inject(TxPasswordGenerator);
  private element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
  private renderer = inject(Renderer2);
  private translations = injectTranslations();
  private readonly needsName = signal(false);
  private readonly defaultName = effect(() => {
    if (this.needsName()) {
      this.renderer.setAttribute(this.element, 'aria-label', this.translations().generatePassword);
    }
  });

  readonly target = input<TxPassword | AbstractControl | null | undefined>(undefined, { alias: 'txPasswordGenerate' });
  readonly length = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly lowercase = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly uppercase = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly digits = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly symbols = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly excludeSimilar = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly reveal = input<boolean, unknown>(true, { transform: booleanAttribute });

  readonly generated = output<string>();

  ngAfterViewInit(): void {
    const element = this.element;
    this.needsName.set(!element.textContent?.trim() && !NAME_ATTRIBUTES.some((name) => element.hasAttribute(name)));
  }

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
