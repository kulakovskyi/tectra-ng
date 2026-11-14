import { Directive, TemplateRef, inject } from '@angular/core';
import { TxToastContext } from './toast.types';

@Directive({ selector: 'ng-template[txToastTemplate]' })
export class TxToastTemplate {
  readonly template = inject<TemplateRef<TxToastContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxToastTemplate, context: unknown): context is TxToastContext {
    return !!context;
  }
}
