import { Directive, TemplateRef, inject, input } from '@angular/core';
import { TxVirtualScrollerContentContext, TxVirtualScrollerItemContext, TxVirtualScrollerLoaderContext } from './virtual-scroller.types';

@Directive({ selector: 'ng-template[txVirtualScrollerItem]' })
export class TxVirtualScrollerItem<T> {
  readonly templateRef = inject<TemplateRef<TxVirtualScrollerItemContext<T>>>(TemplateRef);
  readonly txVirtualScrollerItemOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxVirtualScrollerItem<T>, context: unknown): context is TxVirtualScrollerItemContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txVirtualScrollerLoader]' })
export class TxVirtualScrollerLoader {
  readonly templateRef = inject<TemplateRef<TxVirtualScrollerLoaderContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxVirtualScrollerLoader, context: unknown): context is TxVirtualScrollerLoaderContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txVirtualScrollerLoadingIcon]' })
export class TxVirtualScrollerLoadingIcon {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txVirtualScrollerContent]' })
export class TxVirtualScrollerContent<T> {
  readonly templateRef = inject<TemplateRef<TxVirtualScrollerContentContext<T>>>(TemplateRef);
  readonly txVirtualScrollerContentOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxVirtualScrollerContent<T>, context: unknown): context is TxVirtualScrollerContentContext<T> {
    return !!context;
  }
}
