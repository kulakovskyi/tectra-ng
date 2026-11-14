import { Directive, TemplateRef, inject, input } from '@angular/core';
import { TxSelectGroupContext, TxSelectOptionContext } from './select.types';

@Directive({ selector: 'ng-template[txSelectOption]' })
export class TxSelectOptionTemplate<T> {
  readonly templateRef = inject<TemplateRef<TxSelectOptionContext<T>>>(TemplateRef);
  readonly txSelectOptionOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxSelectOptionTemplate<T>, context: unknown): context is TxSelectOptionContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txSelectValue]' })
export class TxSelectValueTemplate<T> {
  readonly templateRef = inject<TemplateRef<TxSelectOptionContext<T>>>(TemplateRef);
  readonly txSelectValueOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxSelectValueTemplate<T>, context: unknown): context is TxSelectOptionContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txSelectGroup]' })
export class TxSelectGroupTemplate<T> {
  readonly templateRef = inject<TemplateRef<TxSelectGroupContext<T>>>(TemplateRef);
  readonly txSelectGroupOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxSelectGroupTemplate<T>, context: unknown): context is TxSelectGroupContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txSelectHeader]' })
export class TxSelectHeaderTemplate {
  readonly templateRef = inject(TemplateRef);
}

@Directive({ selector: 'ng-template[txSelectFooter]' })
export class TxSelectFooterTemplate {
  readonly templateRef = inject(TemplateRef);
}

@Directive({ selector: 'ng-template[txSelectEmpty]' })
export class TxSelectEmptyTemplate {
  readonly templateRef = inject(TemplateRef);
}

@Directive({ selector: 'ng-template[txSelectEmptyFilter]' })
export class TxSelectEmptyFilterTemplate {
  readonly templateRef = inject<TemplateRef<{ $implicit: string }>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxSelectEmptyFilterTemplate, context: unknown): context is { $implicit: string } {
    return !!context;
  }
}
