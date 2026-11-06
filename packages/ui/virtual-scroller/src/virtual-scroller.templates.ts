import { Directive, TemplateRef, inject } from '@angular/core';
import { TxVirtualScrollerContentContext, TxVirtualScrollerItemContext, TxVirtualScrollerLoaderContext } from './virtual-scroller.types';

@Directive({ selector: 'ng-template[txVirtualScrollerItem]' })
export class TxVirtualScrollerItem {
  readonly templateRef = inject<TemplateRef<TxVirtualScrollerItemContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txVirtualScrollerLoader]' })
export class TxVirtualScrollerLoader {
  readonly templateRef = inject<TemplateRef<TxVirtualScrollerLoaderContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txVirtualScrollerLoadingIcon]' })
export class TxVirtualScrollerLoadingIcon {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txVirtualScrollerContent]' })
export class TxVirtualScrollerContent {
  readonly templateRef = inject<TemplateRef<TxVirtualScrollerContentContext>>(TemplateRef);
}
