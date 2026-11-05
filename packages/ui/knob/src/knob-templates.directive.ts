import { Directive, TemplateRef, inject } from '@angular/core';
import { TxKnobValueContext } from './knob.types';

@Directive({ selector: 'ng-template[txKnobValue]' })
export class TxKnobValueTemplate {
  readonly templateRef = inject<TemplateRef<TxKnobValueContext>>(TemplateRef);
}
