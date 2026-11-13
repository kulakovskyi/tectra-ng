import { Signal, computed, signal } from '@angular/core';

export class TxSelection<T> {
  private readonly selected = signal<ReadonlySet<string>>(new Set());

  readonly selectedIds: Signal<ReadonlySet<string>> = this.selected.asReadonly();
  readonly count = computed(() => this.selected().size);

  constructor(private readonly getKey: (item: T) => string) {}

  select(predicate: (item: T) => boolean, items: readonly T[], isChecked: boolean): void {
    this.change(items.filter(predicate).map((item) => this.getKey(item)), isChecked);
  }

  toggleOne(idOrItem: string | T, isChecked = !this.isSelected(idOrItem)): void {
    this.change([this.keyOf(idOrItem)], isChecked);
  }

  toggleAll(items: readonly T[], isChecked = !this.areAllSelected(items)): void {
    this.change(items.map((item) => this.getKey(item)), isChecked);
  }

  isSelected(idOrItem: string | T): boolean {
    return this.selected().has(this.keyOf(idOrItem));
  }

  areAllSelected(items: readonly T[]): boolean {
    return items.length > 0 && items.every((item) => this.selected().has(this.getKey(item)));
  }

  /** Whether every item that passes the predicate is selected. */
  areAllSelectedWithPredicate(items: readonly T[], predicate: (item: T) => boolean): boolean {
    return this.areAllSelected(items.filter(predicate));
  }

  isPartial(items: readonly T[]): boolean {
    const chosen = items.filter((item) => this.selected().has(this.getKey(item))).length;
    return chosen > 0 && chosen < items.length;
  }

  selectedItems(items: readonly T[]): T[] {
    return items.filter((item) => this.selected().has(this.getKey(item)));
  }

  setSelected(ids: readonly string[]): void {
    this.selected.set(new Set(ids));
  }

  /** Unselects everything. */
  clear(): void {
    this.selected.set(new Set());
  }

  private keyOf(idOrItem: string | T): string {
    return typeof idOrItem === 'string' ? idOrItem : this.getKey(idOrItem);
  }

  private change(keys: readonly string[], isChecked: boolean): void {
    const next = new Set(this.selected());
    keys.forEach((key) => (isChecked ? next.add(key) : next.delete(key)));
    this.selected.set(next);
  }
}
