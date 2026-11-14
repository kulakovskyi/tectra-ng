import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({ selector: 'ng-template[txMessageIcon]' })
export class TxMessageIconTemplate {
  readonly templateRef = inject(TemplateRef);
}

@Directive({ selector: 'ng-template[txMessageCloseIcon]' })
export class TxMessageCloseIconTemplate {
  readonly templateRef = inject(TemplateRef);
}

@Directive({ selector: '[txMessageActions]' })
export class TxMessageActions {}
