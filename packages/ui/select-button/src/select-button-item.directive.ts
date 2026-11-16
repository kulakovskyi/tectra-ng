import { Directive, TemplateRef, inject, input } from '@angular/core';
import { TxSelectButtonItemContext } from './select-button.types';

/** Own content of each `tx-select-button` item; `txSelectButtonItemOf` types the option from the options array. */
@Directive({ selector: 'ng-template[txSelectButtonItem]' })
export class TxSelectButtonItemTemplate<T> {
  readonly templateRef = inject<TemplateRef<TxSelectButtonItemContext<T>>>(TemplateRef);
  readonly txSelectButtonItemOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxSelectButtonItemTemplate<T>, context: unknown): context is TxSelectButtonItemContext<T> {
    return !!context;
  }
}
