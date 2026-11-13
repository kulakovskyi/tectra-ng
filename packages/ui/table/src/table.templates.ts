import { Directive, TemplateRef, computed, inject, input } from '@angular/core';
import { TxTableActionConfig, TxTableCellContext, TxTableEditorContext, TxTableGroupContext, TxTableEmptyContext, TxTableHeaderContext, TxTableRowContext } from './table.types';
import { actionIdOf } from './table.utils';

@Directive({ selector: 'ng-template[txTableCell]' })
export class TxTableCell {
  readonly templateRef = inject<TemplateRef<TxTableCellContext>>(TemplateRef);
  readonly txTableCell = input.required<string>();
}

@Directive({ selector: 'ng-template[txTableEditor]' })
export class TxTableEditor {
  readonly templateRef = inject<TemplateRef<TxTableEditorContext>>(TemplateRef);
  readonly txTableEditor = input.required<string>();
}

@Directive({ selector: 'ng-template[txTableHeaderCell]' })
export class TxTableHeaderCell {
  readonly templateRef = inject<TemplateRef<TxTableHeaderContext>>(TemplateRef);
  readonly txTableHeaderCell = input.required<string>();
}

@Directive({ selector: 'ng-template[txTableFooterCell]' })
export class TxTableFooterCell {
  readonly templateRef = inject<TemplateRef<TxTableHeaderContext>>(TemplateRef);
  readonly txTableFooterCell = input.required<string>();
}

@Directive({ selector: 'ng-template[txTableCard]' })
export class TxTableCard {
  readonly templateRef = inject<TemplateRef<TxTableRowContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTableExpansion]' })
export class TxTableExpansion {
  readonly templateRef = inject<TemplateRef<TxTableRowContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTableActions]' })
export class TxTableActionsTemplate {
  readonly templateRef = inject<TemplateRef<TxTableRowContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTableGroupHeader]' })
export class TxTableGroupHeader {
  readonly templateRef = inject<TemplateRef<TxTableGroupContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTableGroupFooter]' })
export class TxTableGroupFooter {
  readonly templateRef = inject<TemplateRef<TxTableGroupContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTableEmpty]' })
export class TxTableEmpty {
  readonly templateRef = inject<TemplateRef<TxTableEmptyContext>>(TemplateRef);
}

/**
 * A row action button marked with `*txTableAction`; the table lists it in the settings and the right-
 * click menu.
 */
@Directive({ selector: '[txTableAction]' })
export class TxTableAction {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  readonly txTableAction = input.required<TxTableActionConfig>();
  readonly id = computed(() => actionIdOf(this.txTableAction()));
  readonly label = computed(() => this.txTableAction().label);
}
