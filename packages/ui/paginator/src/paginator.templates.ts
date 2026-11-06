import { Directive, TemplateRef, inject } from '@angular/core';
import { TxPaginatorTemplateContext } from './paginator.types';

@Directive({ selector: 'ng-template[txPaginatorStart]' })
export class TxPaginatorStart {
  readonly templateRef = inject<TemplateRef<TxPaginatorTemplateContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txPaginatorEnd]' })
export class TxPaginatorEnd {
  readonly templateRef = inject<TemplateRef<TxPaginatorTemplateContext>>(TemplateRef);
}
