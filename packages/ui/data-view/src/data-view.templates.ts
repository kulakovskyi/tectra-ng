import { Directive, TemplateRef, inject, input } from '@angular/core';
import { TxPaginatorTemplateContext } from '@tectra-ng/ui/paginator';
import { TxDataViewItemsContext } from './data-view.types';

@Directive({ selector: 'ng-template[txDataViewList]' })
export class TxDataViewList<T> {
  readonly templateRef = inject<TemplateRef<TxDataViewItemsContext<T>>>(TemplateRef);
  readonly txDataViewListOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxDataViewList<T>, context: unknown): context is TxDataViewItemsContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txDataViewGrid]' })
export class TxDataViewGrid<T> {
  readonly templateRef = inject<TemplateRef<TxDataViewItemsContext<T>>>(TemplateRef);
  readonly txDataViewGridOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxDataViewGrid<T>, context: unknown): context is TxDataViewItemsContext<T> {
    return !!context;
  }
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

  static ngTemplateContextGuard(_directive: TxDataViewPaginatorStart, context: unknown): context is TxPaginatorTemplateContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txDataViewPaginatorEnd]' })
export class TxDataViewPaginatorEnd {
  readonly templateRef = inject<TemplateRef<TxPaginatorTemplateContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxDataViewPaginatorEnd, context: unknown): context is TxPaginatorTemplateContext {
    return !!context;
  }
}
