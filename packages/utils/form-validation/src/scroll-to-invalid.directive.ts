import { Directive, ElementRef, booleanAttribute, inject, input, output } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { TxFormValidation } from './form-validation.service';

@Directive({
  selector: 'form[txScrollToInvalid]',
  host: { '(submit)': 'check()' },
})
export class TxScrollToInvalid {
  private readonly container = inject(ControlContainer, { self: true });
  private readonly validation = inject(TxFormValidation);
  private readonly host = inject<ElementRef<HTMLFormElement>>(ElementRef);

  readonly focus = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly block = input<ScrollLogicalPosition>('center');

  readonly invalidSubmit = output<void>();
  readonly validSubmit = output<void>();

  check(): void {
    const form = this.container.control;
    if (!form || form.pending) {
      return;
    }
    if (form.invalid) {
      this.validation.scrollToFirstInvalid(form, { scope: this.host.nativeElement, focus: this.focus(), block: this.block() });
      this.invalidSubmit.emit();
    } else {
      this.validSubmit.emit();
    }
  }
}
