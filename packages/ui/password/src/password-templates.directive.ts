import { Directive, TemplateRef, inject } from '@angular/core';
import { TxPasswordTemplateContext } from './password.types';

@Directive({ selector: 'ng-template[txPasswordHeader]' })
export class TxPasswordHeaderTemplate {
  readonly templateRef = inject<TemplateRef<TxPasswordTemplateContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txPasswordContent]' })
export class TxPasswordContentTemplate {
  readonly templateRef = inject<TemplateRef<TxPasswordTemplateContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txPasswordFooter]' })
export class TxPasswordFooterTemplate {
  readonly templateRef = inject<TemplateRef<TxPasswordTemplateContext>>(TemplateRef);
}
