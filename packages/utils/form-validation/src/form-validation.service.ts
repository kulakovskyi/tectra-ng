import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ElementRef, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { firstInvalidElement, focusTarget, markAllTouched } from './form-validation.functions';

export interface TxScrollToInvalidOptions {
  scope?: ParentNode;
  focus?: boolean;
  block?: ScrollLogicalPosition;
}

@Injectable({ providedIn: 'root' })
export class TxFormValidation {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef, { optional: true });

  scrollToFirstInvalid(form: AbstractControl, options: TxScrollToInvalidOptions = {}): boolean {
    markAllTouched(form);
    if (!this.isBrowser) {
      return form.invalid;
    }
    const element = firstInvalidElement(options.scope ?? this.host?.nativeElement ?? this.document);
    if (!element) {
      return false;
    }
    const reduced = this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    element.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: options.block ?? 'center' });
    if (options.focus !== false) {
      focusTarget(element).focus({ preventScroll: true });
    }
    return true;
  }
}
