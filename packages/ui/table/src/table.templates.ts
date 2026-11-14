import { Directive, TemplateRef, computed, inject, input } from '@angular/core';
import { TxTableActionConfig, TxTableCellContext, TxTableEditorContext, TxTableGroupContext, TxTableEmptyContext, TxTableHeaderContext, TxTableRowContext } from './table.types';
import { actionIdOf } from './table.utils';

@Directive({ selector: 'ng-template[txTableCell]' })
export class TxTableCell<T> {
  readonly templateRef = inject<TemplateRef<TxTableCellContext<T>>>(TemplateRef);
  readonly txTableCell = input.required<string>();
  readonly txTableCellOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxTableCell<T>, context: unknown): context is TxTableCellContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTableEditor]' })
export class TxTableEditor<T> {
  readonly templateRef = inject<TemplateRef<TxTableEditorContext<T>>>(TemplateRef);
  readonly txTableEditor = input.required<string>();
  readonly txTableEditorOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxTableEditor<T>, context: unknown): context is TxTableEditorContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTableHeaderCell]' })
export class TxTableHeaderCell {
  readonly templateRef = inject<TemplateRef<TxTableHeaderContext>>(TemplateRef);
  readonly txTableHeaderCell = input.required<string>();

  static ngTemplateContextGuard(_directive: TxTableHeaderCell, context: unknown): context is TxTableHeaderContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTableFooterCell]' })
export class TxTableFooterCell {
  readonly templateRef = inject<TemplateRef<TxTableHeaderContext>>(TemplateRef);
  readonly txTableFooterCell = input.required<string>();

  static ngTemplateContextGuard(_directive: TxTableFooterCell, context: unknown): context is TxTableHeaderContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTableCard]' })
export class TxTableCard<T> {
  readonly templateRef = inject<TemplateRef<TxTableRowContext<T>>>(TemplateRef);
  readonly txTableCardOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxTableCard<T>, context: unknown): context is TxTableRowContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTableExpansion]' })
export class TxTableExpansion<T> {
  readonly templateRef = inject<TemplateRef<TxTableRowContext<T>>>(TemplateRef);
  readonly txTableExpansionOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxTableExpansion<T>, context: unknown): context is TxTableRowContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTableActions]' })
export class TxTableActionsTemplate<T> {
  readonly templateRef = inject<TemplateRef<TxTableRowContext<T>>>(TemplateRef);
  readonly txTableActionsOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxTableActionsTemplate<T>, context: unknown): context is TxTableRowContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTableGroupHeader]' })
export class TxTableGroupHeader<T> {
  readonly templateRef = inject<TemplateRef<TxTableGroupContext<T>>>(TemplateRef);
  readonly txTableGroupHeaderOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxTableGroupHeader<T>, context: unknown): context is TxTableGroupContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTableGroupFooter]' })
export class TxTableGroupFooter<T> {
  readonly templateRef = inject<TemplateRef<TxTableGroupContext<T>>>(TemplateRef);
  readonly txTableGroupFooterOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxTableGroupFooter<T>, context: unknown): context is TxTableGroupContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTableEmpty]' })
export class TxTableEmpty {
  readonly templateRef = inject<TemplateRef<TxTableEmptyContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxTableEmpty, context: unknown): context is TxTableEmptyContext {
    return !!context;
  }
}

/**
 * A row action button marked with `*txTableAction`; the table lists it in the settings and the right-
 * click menu.
 */
@Directive({ selector: '[txTableAction]' })
export class TxTableAction {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  readonly txTableAction = input<TxTableActionConfig | undefined>(undefined);
  readonly id = computed(() => {
    const config = this.txTableAction();
    return config ? actionIdOf(config) : '';
  });
  readonly label = computed(() => this.txTableAction()?.label ?? '');
}
