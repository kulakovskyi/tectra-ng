import { Directive, TemplateRef, inject } from '@angular/core';
import { TxRatingIconContext } from './rating.types';

@Directive({ selector: 'ng-template[txRatingOnIcon]' })
export class TxRatingOnIconTemplate {
  readonly templateRef = inject<TemplateRef<TxRatingIconContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txRatingOffIcon]' })
export class TxRatingOffIconTemplate {
  readonly templateRef = inject<TemplateRef<TxRatingIconContext>>(TemplateRef);
}
