import { InjectionToken, Signal } from '@angular/core';
import { TxTableAction } from './table.templates';
import { TxTableActionsStore } from './table-actions.store';
import { TxColumnFilter, TxTableFilters } from './table.types';

/** Something that can offer the actions of a row for the right-click menu. */
export interface TxTableRowActionsSource {
  /** Actions to show in the right-click menu, in display order. */
  readonly menuActions: Signal<readonly TxTableAction[]>;
}

/** What `tx-table` gives its parts: view mode, actions, filters and editor hooks. */
export interface TxTableContext {
  /** Whether the table shows cards on a narrow screen. */
  readonly cardView: Signal<boolean>;
  /** Store of the row actions. */
  readonly actionsStore: TxTableActionsStore;
  /** Whether columns can be reordered. */
  readonly reorderableColumns: Signal<boolean>;
  /** Moves a column to the position of another one. */
  reorderColumn(field: string, targetField: string): void;
  /** Current column filters by field. */
  readonly filters: Signal<TxTableFilters>;
  /** Milliseconds to wait after typing in a filter before it applies. */
  readonly filterDelay: Signal<number>;
  /** Sets the filter of a column, or clears it with `null`. */
  applyFilter(field: string, filter: TxColumnFilter | null): void;
  /** Registers the actions of a row element for the right-click menu. */
  registerRowActions(row: Element, source: TxTableRowActionsSource): void;
  /** Removes the actions of a row element from the right-click menu. */
  unregisterRowActions(row: Element, source: TxTableRowActionsSource): void;
  /** Tells the table that an editor element is ready, so it can take focus. */
  editorLoaded(editor: HTMLElement): void;
}

/** Injection token through which the parts of a table reach its `tx-table`. */
export const TX_TABLE = new InjectionToken<TxTableContext>('TX_TABLE');
