import { Injectable, computed, signal } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { TxTableActionItem } from './table.types';

const ACTION_BUTTON_WIDTH = 30;
const ACTION_BUTTON_GAP = 7;
const ACTIONS_CELL_PADDING = 24.5;
const MIN_ACTIONS_COLUMN_WIDTH = 90;

/** Keeps the order and pinned state of the row actions of one table. */
@Injectable()
export class TxTableActionsStore {
  /** How many actions show inline until the user pins others. */
  readonly inlineCount = signal(0);
  /** Ids of the actions in the order the user chose. */
  readonly order = signal<string[]>([]);
  /** Ids of the actions the user pinned inline; `null` while the user has not chosen. */
  readonly pinned = signal<ReadonlySet<string> | null>(null);
  private readonly registry = signal<TxTableActionItem[]>([]);
  private listener: () => void = () => undefined;

  /** Registered actions in display order. */
  readonly registeredActions = computed<TxTableActionItem[]>(() => {
    const registry = this.registry();
    const byId = new Map(registry.map((item) => [item.id, item]));
    const result: TxTableActionItem[] = [];
    this.order().forEach((id) => {
      const item = byId.get(id);
      if (item) {
        result.push(item);
        byId.delete(id);
      }
    });
    registry.forEach((item) => byId.has(item.id) && result.push(item));
    return result;
  });

  private readonly defaultPinned = computed(() => new Set(this.registeredActions().slice(0, this.inlineCount()).map((item) => item.id)));
  /** Ids of the actions shown inline. */
  readonly pinnedIds = computed<ReadonlySet<string>>(() => this.pinned() ?? this.defaultPinned());

  /** Width of the actions column that fits the inline buttons, as a CSS length. */
  readonly columnWidth = computed(() => {
    const actions = this.registeredActions();
    const pinned = actions.filter((item) => this.pinnedIds().has(item.id)).length;
    const buttons = actions.length ? pinned + (pinned < actions.length ? 1 : 0) : this.inlineCount() + 1;
    const width = buttons * ACTION_BUTTON_WIDTH + Math.max(0, buttons - 1) * ACTION_BUTTON_GAP + ACTIONS_CELL_PADDING;
    return `${Math.max(width, MIN_ACTIONS_COLUMN_WIDTH)}px`;
  });

  /** Sets the function called after the user pins or reorders actions. */
  onChange(listener: () => void): void {
    this.listener = listener;
  }

  /** Loads the saved action order and pinned ids. */
  restore(order: readonly string[] | undefined, pinned: readonly string[] | undefined): void {
    this.order.set(order ? [...order] : []);
    this.pinned.set(pinned ? new Set(pinned) : null);
  }

  /** Adds actions, or updates the label of known ones. */
  register(actions: readonly TxTableActionItem[]): void {
    const existing = this.registry();
    const incoming = new Map(actions.map((item) => [item.id, item]));
    let changed = false;
    const merged = existing.map((item) => {
      const next = incoming.get(item.id);
      if (next && next.label !== item.label) {
        changed = true;
        return next;
      }
      return item;
    });
    const known = new Set(existing.map((item) => item.id));
    const additions = actions.filter((item) => !known.has(item.id));
    if (additions.length || changed) {
      this.registry.set([...merged, ...additions]);
    }
  }

  /** Whether the action with the given id is shown inline. */
  isPinned(id: string): boolean {
    return this.pinnedIds().has(id);
  }

  /** Shows the action inline or moves it to the popover. */
  setPinned(id: string, pinned: boolean): void {
    const next = new Set(this.pinnedIds());
    if (pinned) next.add(id);
    else next.delete(id);
    this.pinned.set(next);
    this.listener();
  }

  /** Moves an action from one position to another. */
  reorder(from: number, to: number): void {
    const ids = this.registeredActions().map((item) => item.id);
    moveItemInArray(ids, from, to);
    this.order.set(ids);
    this.listener();
  }
}
