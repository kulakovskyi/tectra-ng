import { Directive, TemplateRef, inject } from '@angular/core';
import { TxPasswordTemplateContext } from './password.types';

@Directive({ selector: 'ng-template[txPasswordHeader]' })
export class TxPasswordHeaderTemplate {
  readonly templateRef = inject<TemplateRef<TxPasswordTemplateContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxPasswordHeaderTemplate, context: unknown): context is TxPasswordTemplateContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txPasswordContent]' })
export class TxPasswordContentTemplate {
  readonly templateRef = inject<TemplateRef<TxPasswordTemplateContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxPasswordContentTemplate, context: unknown): context is TxPasswordTemplateContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txPasswordFooter]' })
export class TxPasswordFooterTemplate {
  readonly templateRef = inject<TemplateRef<TxPasswordTemplateContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxPasswordFooterTemplate, context: unknown): context is TxPasswordTemplateContext {
    return !!context;
  }
}
