import { Directive, TemplateRef, inject } from '@angular/core';
import { TxChipsInputItemContext } from './chips-input.types';

@Directive({ selector: 'ng-template[txChipsInputItem]' })
export class TxChipsInputItemTemplate {
  readonly templateRef = inject<TemplateRef<TxChipsInputItemContext>>(TemplateRef);
}
