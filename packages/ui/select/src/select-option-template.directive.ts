import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({ selector: 'ng-template[txSelectOption]' })
export class TxSelectOptionTemplate {
  readonly templateRef = inject(TemplateRef);
}
