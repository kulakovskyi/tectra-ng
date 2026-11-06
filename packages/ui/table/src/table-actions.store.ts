import { Injectable, computed, signal } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { TxTableActionItem } from './table.types';

const ACTION_BUTTON_WIDTH = 30;
const ACTION_BUTTON_GAP = 7;
const ACTIONS_CELL_PADDING = 24.5;
const MIN_ACTIONS_COLUMN_WIDTH = 90;

@Injectable()
export class TxTableActionsStore {
  readonly inlineCount = signal(0);
  readonly order = signal<string[]>([]);
  readonly pinned = signal<ReadonlySet<string> | null>(null);
  private readonly registry = signal<TxTableActionItem[]>([]);
  private listener: () => void = () => undefined;

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
  readonly pinnedIds = computed<ReadonlySet<string>>(() => this.pinned() ?? this.defaultPinned());

  readonly columnWidth = computed(() => {
    const actions = this.registeredActions();
    const pinned = actions.filter((item) => this.pinnedIds().has(item.id)).length;
    const buttons = actions.length ? pinned + (pinned < actions.length ? 1 : 0) : this.inlineCount() + 1;
    const width = buttons * ACTION_BUTTON_WIDTH + Math.max(0, buttons - 1) * ACTION_BUTTON_GAP + ACTIONS_CELL_PADDING;
    return `${Math.max(width, MIN_ACTIONS_COLUMN_WIDTH)}px`;
  });

  onChange(listener: () => void): void {
    this.listener = listener;
  }

  restore(order: readonly string[] | undefined, pinned: readonly string[] | undefined): void {
    this.order.set(order ? [...order] : []);
    this.pinned.set(pinned ? new Set(pinned) : null);
  }

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

  isPinned(id: string): boolean {
    return this.pinnedIds().has(id);
  }

  setPinned(id: string, pinned: boolean): void {
    const next = new Set(this.pinnedIds());
    if (pinned) next.add(id);
    else next.delete(id);
    this.pinned.set(next);
    this.listener();
  }

  reorder(from: number, to: number): void {
    const ids = this.registeredActions().map((item) => item.id);
    moveItemInArray(ids, from, to);
    this.order.set(ids);
    this.listener();
  }
}
