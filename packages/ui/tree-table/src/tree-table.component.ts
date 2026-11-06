import { ChangeDetectionStrategy, Component, Signal, afterNextRender, booleanAttribute, computed, effect, input, linkedSignal, model, output, signal, untracked } from '@angular/core';
import { TxResolvedPassThrough, injectPassThrough } from '@tectra-ng/core/config';
import { CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TxIcon } from '@tectra-ng/icons';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxMenu, TxMenuItemTemplate } from '@tectra-ng/ui/menu';
import { TxPaginator } from '@tectra-ng/ui/paginator';
import { TxProgressSpinner } from '@tectra-ng/ui/progress-spinner';
import { TxRadioButton } from '@tectra-ng/ui/radio-button';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';
import {
  TX_TABLE,
  TxTable,
  TxTableActionsStore,
  TxTableColumnFilter,
  TxTablePart,
  TxTableRenderRow,
  TxTableSettings,
  filterRows,
  resolveField,
  sortRows,
} from '@tectra-ng/ui/table';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxTreeTableFilterMode, TxTreeTableNode, TxTreeTableNodeEvent } from './tree-table.types';

const COLLAPSE_DURATION = 400;

export function flattenTreeTable<T>(nodes: readonly TxTreeTableNode<T>[]): TxTreeTableNode<T>[] {
  const result: TxTreeTableNode<T>[] = [];
  const walk = (items: readonly TxTreeTableNode<T>[]) =>
    items.forEach((node) => {
      result.push(node);
      walk(node.children ?? []);
    });
  walk(nodes);
  return result;
}

export function filterTreeTable<T>(nodes: readonly TxTreeTableNode<T>[], matches: (node: TxTreeTableNode<T>) => boolean, mode: TxTreeTableFilterMode = 'lenient'): TxTreeTableNode<T>[] {
  const visit = (node: TxTreeTableNode<T>): TxTreeTableNode<T> | null => {
    const own = matches(node);
    const children = node.children ?? [];
    if (own && (mode === 'lenient' || !children.length)) return node;
    const kept = children.map(visit).filter((child): child is TxTreeTableNode<T> => child !== null);
    if (kept.length) return { ...node, children: kept };
    return own ? { ...node, children: [] } : null;
  };
  return nodes.map(visit).filter((node): node is TxTreeTableNode<T> => node !== null);
}

@Component({
  selector: 'tx-tree-table',
  imports: [
    NgTemplateOutlet,
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    TxIcon,
    TxTooltip,
    TxSkeleton,
    TxButton,
    TxCheckbox,
    TxInput,
    TxInputNumber,
    TxDatePicker,
    TxSelect,
    TxRadioButton,
    TxPaginator,
    TxProgressSpinner,
    TxMenu,
    TxMenuItemTemplate,
    TxTableSettings,
    TxTableColumnFilter,
  ],
  templateUrl: '../../table/src/table.component.html',
  styleUrl: '../../table/src/table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TxTableActionsStore, { provide: TX_TABLE, useExisting: TxTreeTable }],
  host: { class: 'tx-tree-table' },
})
export class TxTreeTable<T = unknown> extends TxTable<TxTreeTableNode<T>> {
  override readonly isTree = true;
  override readonly responsive = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly expandedKeys = model<unknown[]>([]);
  readonly filterMode = input<TxTreeTableFilterMode>('lenient');
  readonly propagateSelectionUp = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly propagateSelectionDown = input<boolean, unknown>(true, { transform: booleanAttribute });

  readonly nodeExpand = output<TxTreeTableNodeEvent<T>>();
  readonly nodeCollapse = output<TxTreeTableNodeEvent<T>>();

  override readonly passThrough: Signal<TxResolvedPassThrough<TxTablePart>> = injectPassThrough('treeTable', this, this.pt, this.ptOptions);

  private readonly seenKeys = new Set<unknown>();
  readonly pendingKeys = signal<ReadonlySet<unknown>>(new Set());
  readonly mountedKeys = signal<ReadonlySet<unknown>>(new Set());

  readonly allNodes = computed(() => flattenTreeTable(this.value() ?? []));
  readonly selectedIds = computed<ReadonlySet<unknown>>(() => {
    const selection = this.selection();
    if (!selection) return new Set();
    return new Set((Array.isArray(selection) ? selection : [selection]).map((node) => this.identityOf(node)));
  });
  private readonly matchedData = computed<ReadonlySet<unknown> | null>(() => {
    if (this.lazy()) return null;
    const data = this.allNodes().map((node) => node.data);
    const fields = this.globalFilterFields() ?? this.visibleColumns().map((column) => column.filterField ?? column.field);
    const matched = filterRows(data, this.filters(), this.columns(), this.globalFilter(), fields, this.localeService.locale().intl);
    return matched.length === data.length ? null : new Set(matched);
  });
  override readonly filteredRows = computed(() => {
    const roots = [...this.allRows()];
    const matched = this.matchedData();
    return matched ? filterTreeTable(roots, (node) => matched.has(node.data), this.filterMode()) : roots;
  });
  readonly filterOpen = linkedSignal<ReadonlySet<unknown>>(() => {
    if (!this.matchedData()) return new Set();
    return new Set(
      flattenTreeTable(this.filteredRows())
        .filter((node) => node.children?.length)
        .map((node) => this.identityOf(node)),
    );
  });
  readonly expandedSet = computed<ReadonlySet<unknown>>(() => (this.matchedData() ? this.filterOpen() : new Set(this.expandedKeys())));
  override readonly sortedRows = computed(() => {
    const roots = this.filteredRows();
    const meta = this.sortMeta();
    if (this.lazy() || this.customSort() || !meta.length) return [...roots];
    const dataMeta = meta.map((item) => ({ ...item, field: `data.${item.field}` }));
    const intl = this.localeService.locale().intl;
    const sort = (nodes: readonly TxTreeTableNode<T>[]): TxTreeTableNode<T>[] =>
      sortRows(nodes, dataMeta, intl).map((node) => (node.children?.length ? { ...node, children: sort(node.children) } : node));
    return sort(roots);
  });
  override readonly renderRows = computed<TxTableRenderRow<TxTreeTableNode<T>>[]>(() => {
    this.editVersion();
    const expanded = this.expandedSet();
    const mounted = this.animatedRows() ? this.mountedKeys() : new Set<unknown>();
    const pending = this.pendingKeys();
    const selected = this.selectedIds();
    const partialOn = this.treeCheckbox() && this.propagateSelectionUp();
    const rowSelectable = this.rowSelectable();
    const offset = this.paginator() && !this.lazy() && this.totalRecords() === undefined ? this.first() : 0;
    const rows: TxTableRenderRow<TxTreeTableNode<T>>[] = [];
    const walk = (nodes: readonly TxTreeTableNode<T>[], level: number, parentKey: unknown, hidden: boolean) =>
      nodes.forEach((node, position) => {
        const key = this.identityOf(node);
        const leaf = node.leaf === false ? false : !node.children?.length;
        const open = !leaf && expanded.has(key);
        const index = offset + rows.length;
        const isSelected = selected.has(key);
        rows.push({
          row: node,
          index,
          key,
          selected: isSelected,
          selectable: node.selectable !== false && (!rowSelectable || rowSelectable(node, index)),
          expanded: false,
          group: null,
          tree: {
            level,
            leaf,
            expanded: open,
            hidden,
            loading: !!node.loading || (pending.has(key) && node.children === undefined),
            partial: partialOn && !isSelected && this.hasSelectedDescendant(node, selected),
            setSize: nodes.length,
            posInSet: position + 1,
            parentKey,
          },
        });
        if ((open || mounted.has(key)) && node.children?.length) walk(node.children, level + 1, key, hidden || !open);
      });
    walk(this.pageRows(), 1, null, false);
    return rows;
  });
  override readonly allSelected = computed(() => {
    const own = this.selectAll();
    if (own !== undefined) return own;
    const nodes = this.allNodes().filter((node) => node.selectable !== false);
    const selected = this.selectedIds();
    return nodes.length > 0 && nodes.every((node) => selected.has(this.identityOf(node)));
  });
  override readonly someSelected = computed(() => {
    if (this.allSelected()) return false;
    const selected = this.selectedIds();
    return this.allNodes().some((node) => selected.has(this.identityOf(node)));
  });

  protected override treeRowKey = (item: TxTableRenderRow<TxTreeTableNode<T>>, position: number, event: KeyboardEvent): boolean => {
    const tree = item.tree;
    if (!tree) return false;
    const rows = this.renderRows();
    const shown = rows.map((row, index) => (row.tree?.hidden ? -1 : index)).filter((index) => index >= 0);
    const at = shown.indexOf(position);
    const step: Record<string, number> = { ArrowDown: shown[at + 1], ArrowUp: shown[at - 1], Home: shown[0], End: shown[shown.length - 1] };
    if (event.key in step) {
      event.preventDefault();
      const target = step[event.key];
      if (target !== undefined) this.focusRowAt(target);
      return true;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (!tree.leaf && !tree.expanded) this.expandNode(item, event);
      else if (tree.expanded && shown[at + 1] !== undefined) this.focusRowAt(shown[at + 1]);
      return true;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (tree.expanded) this.collapseNode(item, event);
      else if (tree.parentKey !== null) {
        const parent = rows.findIndex((row) => row.key === tree.parentKey);
        if (parent >= 0) this.focusRowAt(parent);
      }
      return true;
    }
    return false;
  };

  constructor() {
    super();
    effect(() => {
      const fresh: unknown[] = [];
      this.allNodes().forEach((node) => {
        const key = this.identityOf(node);
        if (this.seenKeys.has(key)) return;
        this.seenKeys.add(key);
        if (node.expanded) fresh.push(key);
      });
      if (fresh.length) untracked(() => this.expandedKeys.update((keys) => [...keys, ...fresh.filter((key) => !keys.includes(key))]));
    });
  }

  override dataOf(row: TxTreeTableNode<T>): unknown {
    return row?.data;
  }

  override identityOf(row: TxTreeTableNode<T>): unknown {
    if (row?.key !== undefined) return row.key;
    const dataKey = this.dataKey();
    return dataKey ? resolveField(row?.data, dataKey) : row?.data;
  }

  override rowsFocusable(): boolean {
    return true;
  }

  override toggleNode(item: TxTableRenderRow<TxTreeTableNode<T>>, event: Event): void {
    event.stopPropagation();
    if (!item.tree || item.tree.leaf) return;
    if (item.tree.expanded) this.collapseNode(item, event);
    else this.expandNode(item, event);
  }

  expandNode(item: TxTableRenderRow<TxTreeTableNode<T>>, event?: Event): void {
    if (!item.tree || item.tree.leaf || item.tree.expanded) return;
    this.setOpen(item.key, true);
    if (item.row.leaf === false && item.row.children === undefined) this.pendingKeys.update((keys) => new Set([...keys, item.key]));
    this.nodeExpand.emit({ node: item.row, originalEvent: event });
  }

  collapseNode(item: TxTableRenderRow<TxTreeTableNode<T>>, event?: Event): void {
    if (!item.tree?.expanded) return;
    this.setOpen(item.key, false);
    this.nodeCollapse.emit({ node: item.row, originalEvent: event });
  }

  expandAll(): void {
    this.expandedKeys.set(
      this.allNodes()
        .filter((node) => node.children?.length)
        .map((node) => this.identityOf(node)),
    );
  }

  collapseAll(): void {
    this.expandedKeys.set([]);
  }

  override toggleRow(item: TxTableRenderRow<TxTreeTableNode<T>>, event?: Event): void {
    if (!this.treeCheckbox()) {
      super.toggleRow(item, event);
      return;
    }
    if (!item.selectable) return;
    const ids = new Set(this.selectedIds());
    const check = !item.selected;
    const affected = this.propagateSelectionDown() ? flattenTreeTable([item.row]).filter((node) => node.selectable !== false) : [item.row];
    affected.forEach((node) => (check ? ids.add(this.identityOf(node)) : ids.delete(this.identityOf(node))));
    if (this.propagateSelectionUp()) this.settle(this.value() ?? [], ids);
    this.selection.set(this.allNodes().filter((node) => ids.has(this.identityOf(node))));
    (check ? this.rowSelect : this.rowUnselect).emit({ row: item.row, index: item.index, originalEvent: event });
  }

  override toggleAll(checked: boolean): void {
    this.selectAllChange.emit(checked);
    if (this.selectAll() !== undefined) return;
    this.selection.set(checked ? this.allNodes().filter((node) => node.selectable !== false) : []);
  }

  protected override exportRows(): TxTreeTableNode<T>[] {
    return flattenTreeTable(this.sortedRows());
  }

  private setOpen(key: unknown, open: boolean): void {
    if (!this.animatedRows()) {
      this.writeOpen(key, open);
      return;
    }
    if (open) {
      if (this.mountedKeys().has(key)) {
        this.writeOpen(key, true);
        return;
      }
      this.mountedKeys.update((keys) => new Set([...keys, key]));
      afterNextRender(
        () => {
          this.host.nativeElement.getBoundingClientRect();
          this.writeOpen(key, true);
        },
        { injector: this.injector },
      );
      return;
    }
    this.mountedKeys.update((keys) => new Set([...keys, key]));
    this.writeOpen(key, false);
    setTimeout(() => {
      if (this.expandedSet().has(key)) return;
      this.mountedKeys.update((keys) => new Set([...keys].filter((other) => other !== key)));
    }, COLLAPSE_DURATION);
  }

  private writeOpen(key: unknown, open: boolean): void {
    if (this.matchedData()) {
      this.filterOpen.update((keys) => new Set(open ? [...keys, key] : [...keys].filter((other) => other !== key)));
      return;
    }
    this.expandedKeys.update((keys) => (open ? [...keys, key] : keys.filter((other) => other !== key)));
  }

  private settle(nodes: readonly TxTreeTableNode<T>[], ids: Set<unknown>): void {
    const visit = (node: TxTreeTableNode<T>): boolean => {
      const children = (node.children ?? []).filter((child) => child.selectable !== false);
      const key = this.identityOf(node);
      if (!children.length) return ids.has(key);
      const all = children.map(visit).every(Boolean);
      if (all) ids.add(key);
      else ids.delete(key);
      return all;
    };
    nodes.forEach(visit);
  }

  private hasSelectedDescendant(node: TxTreeTableNode<T>, selected: ReadonlySet<unknown>): boolean {
    return (node.children ?? []).some((child) => selected.has(this.identityOf(child)) || this.hasSelectedDescendant(child, selected));
  }
}
