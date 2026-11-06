import { Directive, TemplateRef, inject } from '@angular/core';
import { TxAccordionItemContext, TxAccordionToggleIconContext } from './accordion.types';

@Directive({ selector: 'ng-template[txAccordionHeader]' })
export class TxAccordionHeaderTemplate {
  readonly template = inject<TemplateRef<TxAccordionItemContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxAccordionHeaderTemplate, context: unknown): context is TxAccordionItemContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txAccordionContent]' })
export class TxAccordionContentTemplate {
  readonly template = inject<TemplateRef<TxAccordionItemContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxAccordionContentTemplate, context: unknown): context is TxAccordionItemContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txAccordionToggleIcon]' })
export class TxAccordionToggleIconTemplate {
  readonly template = inject<TemplateRef<TxAccordionToggleIconContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxAccordionToggleIconTemplate, context: unknown): context is TxAccordionToggleIconContext {
    return !!context;
  }
}
