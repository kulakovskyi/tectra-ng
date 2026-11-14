import { Directive, TemplateRef, inject } from '@angular/core';
import { TxKnobValueContext } from './knob.types';

@Directive({ selector: 'ng-template[txKnobValue]' })
export class TxKnobValueTemplate {
  readonly templateRef = inject<TemplateRef<TxKnobValueContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxKnobValueTemplate, context: unknown): context is TxKnobValueContext {
    return !!context;
  }
}
