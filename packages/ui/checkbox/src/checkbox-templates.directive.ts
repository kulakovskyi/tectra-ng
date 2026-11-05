import { Directive, TemplateRef, inject } from '@angular/core';
import { TxCheckboxIconContext } from './checkbox.types';

@Directive({ selector: 'ng-template[txCheckboxIcon]' })
export class TxCheckboxIconTemplate {
  readonly templateRef = inject<TemplateRef<TxCheckboxIconContext>>(TemplateRef);
}
