import { Directive, TemplateRef, inject } from '@angular/core';
import { TxCountdownContext } from './countdown.types';

@Directive({ selector: 'ng-template[txCountdownValue]' })
export class TxCountdownValue {
  readonly templateRef = inject<TemplateRef<TxCountdownContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxCountdownValue, context: unknown): context is TxCountdownContext {
    return !!context;
  }
}
