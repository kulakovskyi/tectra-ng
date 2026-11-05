import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({ selector: 'ng-template[txButtonIcon]' })
export class TxButtonIconTemplate {
  readonly templateRef = inject(TemplateRef);
}

@Directive({ selector: 'ng-template[txButtonLoadingIcon]' })
export class TxButtonLoadingIconTemplate {
  readonly templateRef = inject(TemplateRef);
}
