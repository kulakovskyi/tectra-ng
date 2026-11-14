import { Directive, TemplateRef, inject } from '@angular/core';
import { TxChipsInputItemContext } from './chips-input.types';

@Directive({ selector: 'ng-template[txChipsInputItem]' })
export class TxChipsInputItemTemplate {
  readonly templateRef = inject<TemplateRef<TxChipsInputItemContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxChipsInputItemTemplate, context: unknown): context is TxChipsInputItemContext {
    return !!context;
  }
}
