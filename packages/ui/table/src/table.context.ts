import { InjectionToken, Signal } from '@angular/core';
import { TxTableAction } from './table.templates';
import { TxTableActionsStore } from './table-actions.store';

export interface TxTableRowActionsSource {
  readonly menuActions: Signal<readonly TxTableAction[]>;
}

export interface TxTableContext {
  readonly cardView: Signal<boolean>;
  readonly actionsStore: TxTableActionsStore;
  readonly reorderableColumns: Signal<boolean>;
  reorderColumn(field: string, targetField: string): void;
  registerRowActions(row: Element, source: TxTableRowActionsSource): void;
  unregisterRowActions(row: Element, source: TxTableRowActionsSource): void;
}

export const TX_TABLE = new InjectionToken<TxTableContext>('TX_TABLE');
