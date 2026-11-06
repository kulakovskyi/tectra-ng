import { Directive, TemplateRef, inject } from '@angular/core';
import { TxPaginatorTemplateContext } from '@tectra-ng/ui/paginator';
import { TxDataViewItemsContext } from './data-view.types';

@Directive({ selector: 'ng-template[txDataViewList]' })
export class TxDataViewList {
  readonly templateRef = inject<TemplateRef<TxDataViewItemsContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txDataViewGrid]' })
export class TxDataViewGrid {
  readonly templateRef = inject<TemplateRef<TxDataViewItemsContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txDataViewHeader]' })
export class TxDataViewHeader {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txDataViewFooter]' })
export class TxDataViewFooter {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txDataViewEmpty]' })
export class TxDataViewEmpty {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txDataViewLoading]' })
export class TxDataViewLoading {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txDataViewPaginatorStart]' })
export class TxDataViewPaginatorStart {
  readonly templateRef = inject<TemplateRef<TxPaginatorTemplateContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txDataViewPaginatorEnd]' })
export class TxDataViewPaginatorEnd {
  readonly templateRef = inject<TemplateRef<TxPaginatorTemplateContext>>(TemplateRef);
}
