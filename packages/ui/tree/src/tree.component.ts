import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TxTypeahead, uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraTreeTokens, toStyleObject } from '@tectra-ng/themes';
import { TxIconField, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxMenu, TxMenuItem } from '@tectra-ng/ui/menu';
import { TxTreeDragService, TxTreeDragSource } from './tree-drag.service';
import { TxTreeCheckboxIcon, TxTreeEmpty, TxTreeFilter, TxTreeFooter, TxTreeHeader, TxTreeLoading, TxTreeNodeTemplate, TxTreeToggleIcon } from './tree.templates';
import {
  TxTreeDropPosition,
  TxTreeFilterContext,
  TxTreeFilterEvent,
  TxTreeFilterMode,
  TxTreeLoadingMode,
  TxTreeNode,
  TxTreeNodeContext,
  TxTreeNodeDropEvent,
  TxTreeNodeEvent,
  TxTreePart,
  TxTreeScope,
  TxTreeSelection,
  TxTreeSelectionMode,
} from './tree.types';
import {
  branchKeys,
  descendantKeys,
  filterTree,
  findNode,
  insertNode,
  isDescendantOf,
  isLeafNode,
  moveNode,
  normalizeChecked,
  removeNode,
  scopesMatch,
  siblingsOf,
  walkTree,
} from './tree.utils';
import { TREE_ICON_DEFAULTS } from './tree.icons';
import { TREE_THEME } from './tree.theme';

/** One rendered node of `tx-tree` with the state the template needs. */
export interface TxTreeRow<T = unknown> {
  /** DOM id of the node element. */
  id: string;
  /** The node data. */
  node: TxTreeNode<T>;
  /** Depth of the node, the first level is 1. */
  level: number;
  /** Number of siblings on this level, for `aria-setsize`. */
  setSize: number;
  /** Position among the siblings from 1, for `aria-posinset`. */
  posInSet: number;
  /** Key of the parent node; `null` at the top. */
  parentKey: string | null;
  /** Whether the node has no children to show. */
  leaf: boolean;
  /** Whether the node is open. */
  expanded: boolean;
  /** Whether the node is loading its children. */
  loading: boolean;
  /** Whether the node is selected. */
  selected: boolean;
  /** Whether the node is checked. */
  checked: boolean;
  /** Whether some, not all, descendants are checked. */
  partial: boolean;
  /** Whether the node can be selected or checked. */
  selectable: boolean;
  /** Whether the node can be dragged. */
  draggable: boolean;
  /** Icon shown for the node in its current state; `null` for none. */
  icon: TxIconName | null;
  /** Rows of the child nodes that are rendered. */
  children: TxTreeRow<T>[];
}

/** Where a drag would land now. */
interface TxTreeDropTarget {
  /** Key of the target node; `null` for the empty root. */
  key: string | null;
  /** Where the node lands relative to the target. */
  position: TxTreeDropPosition;
}

/**
 * A hierarchy as a WAI-ARIA tree: open, select, check, search, load lazily, drag and drop,
 * and a context menu.
 */
@Component({
  selector: 'tx-tree',
  imports: [NgTemplateOutlet, TxIcon, TxIconField, TxInputIcon, TxInput, TxMenu],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-tree',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-tree--loading]': 'loading()',
    '[class.tx-tree--scrollable]': 'scrollHeight() === "flex"',
  },
  viewProviders: [provideTxIconDefaults(TREE_ICON_DEFAULTS)],
})
export class TxTree<T = unknown> implements TxTreeDragSource {
  private readonly treeTheme = injectTokens(TREE_THEME);

  readonly value = model<TxTreeNode<T>[]>([]);
  readonly selectionMode = input<TxTreeSelectionMode | null | undefined>(undefined);
  readonly selection = model<TxTreeSelection<T>>(null);
  readonly expandedKeys = model<string[]>([]);
  readonly metaKeySelection = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly propagateSelectionUp = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly propagateSelectionDown = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly highlightOnSelect = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly contextMenu = input<TxMenuItem[] | null | undefined>(undefined);
  readonly contextMenuSelection = model<TxTreeNode<T> | null>(null);
  readonly draggableNodes = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly droppableNodes = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly draggableScope = input<TxTreeScope>(undefined);
  readonly droppableScope = input<TxTreeScope>(undefined);
  readonly validateDrop = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loadingMode = input<TxTreeLoadingMode>('mask');
  readonly loadingIcon = input<TxIconName>('spinner');
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly filter = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly filterBy = input('label');
  readonly filterMode = input<TxTreeFilterMode>('lenient');
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly filterInputAutoFocus = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly scrollHeight = input<string | undefined>(undefined);
  readonly virtualScroll = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly virtualScrollItemSize = input(30, { transform: numberAttribute });
  readonly virtualScrollTolerance = input(10, { transform: numberAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraTreeTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxTreePart, TxTree<T>> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly nodeSelect = output<TxTreeNodeEvent<T>>();
  readonly nodeUnselect = output<TxTreeNodeEvent<T>>();
  readonly nodeExpand = output<TxTreeNodeEvent<T>>();
  readonly nodeCollapse = output<TxTreeNodeEvent<T>>();
  readonly nodeContextMenuSelect = output<TxTreeNodeEvent<T>>();
  readonly nodeDoubleClick = output<TxTreeNodeEvent<T>>();
  readonly nodeDrop = output<TxTreeNodeDropEvent<T>>();
  readonly filtered = output<TxTreeFilterEvent<T>>();

  readonly nodeTemplates = contentChildren(TxTreeNodeTemplate);
  readonly headerTemplate = contentChild(TxTreeHeader);
  readonly footerTemplate = contentChild(TxTreeFooter);
  readonly emptyTemplate = contentChild(TxTreeEmpty);
  readonly loadingTemplate = contentChild(TxTreeLoading);
  readonly filterTemplate = contentChild(TxTreeFilter);
  readonly toggleIconTemplate = contentChild(TxTreeToggleIcon);
  readonly checkboxIconTemplate = contentChild(TxTreeCheckboxIcon);

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly dragService = inject(TxTreeDragService);
  private readonly typeahead = new TxTypeahead();
  private readonly menu = viewChild<TxMenu>('nodeMenu');
  private readonly wrapper = viewChild<ElementRef<HTMLElement>>('wrapper');
  private readonly filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');
  private readonly seenKeys = new Set<string>();
  private anchor: HTMLElement | null = null;

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('tree', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-tree'), ...this.passThrough().root?.style }));
  readonly treeId = uniqueId('tx-tree');

  readonly query = signal('');
  readonly focusedKey = signal<string | null>(null);
  readonly pendingKeys = signal<ReadonlySet<string>>(new Set());
  readonly mountedKeys = signal<ReadonlySet<string>>(new Set());
  readonly draggingKey = signal<string | null>(null);
  readonly dropTarget = signal<TxTreeDropTarget | null>(null);
  readonly menuOpen = signal(false);
  readonly menuItems = signal<TxMenuItem[]>([]);
  readonly scrollTop = signal(0);
  readonly viewportHeight = signal(0);

  readonly filtering = computed(() => this.filter() && this.query().trim().length > 0);
  readonly filterFields = computed(() =>
    this.filterBy()
      .split(',')
      .map((field) => field.trim())
      .filter(Boolean),
  );
  readonly filteredValue = computed(() => (this.filtering() ? filterTree(this.value(), this.query(), this.filterFields(), this.filterMode()) : this.value()));
  readonly filterExpanded = linkedSignal<ReadonlySet<string>>(() => new Set(this.filtering() ? branchKeys(this.filteredValue()) : []));
  readonly expandedSet = computed<ReadonlySet<string>>(() => (this.filtering() ? this.filterExpanded() : new Set(this.expandedKeys())));
  readonly selectedKeys = computed<ReadonlySet<string>>(() => {
    const selection = this.selection();
    if (!selection) return new Set();
    return new Set((Array.isArray(selection) ? selection : [selection]).map((node) => node.key));
  });
  readonly templatesByType = computed(() => new Map(this.nodeTemplates().map((template) => [template.txTreeNode(), template.templateRef])));
  readonly multiselectable = computed(() => this.selectionMode() === 'multiple' || this.selectionMode() === 'checkbox');
  readonly checkboxMode = computed(() => this.selectionMode() === 'checkbox');

  readonly tree = computed<TxTreeRow<T>[]>(() => {
    const expanded = this.expandedSet();
    const mounted = this.virtualScroll() ? new Set<string>() : this.mountedKeys();
    const selected = this.selectedKeys();
    const pending = this.pendingKeys();
    const checkbox = this.checkboxMode();
    const up = this.propagateSelectionUp();
    const draggable = this.draggableNodes();
    const build = (nodes: readonly TxTreeNode<T>[], level: number, parentKey: string | null): TxTreeRow<T>[] =>
      nodes.map((node, index) => {
        const leaf = isLeafNode(node);
        const open = !leaf && expanded.has(node.key);
        const children = (open || mounted.has(node.key)) && node.children?.length ? build(node.children, level + 1, node.key) : [];
        const checked = selected.has(node.key);
        const icon = (open ? node.expandedIcon : node.collapsedIcon) ?? node.icon ?? null;
        return {
          id: `${this.treeId}-${node.key}`,
          node,
          level,
          setSize: nodes.length,
          posInSet: index + 1,
          parentKey,
          leaf,
          expanded: open,
          loading: !!node.loading || (pending.has(node.key) && node.children === undefined),
          selected: checked,
          checked,
          partial: checkbox && up && !checked && this.hasCheckedDescendant(node, selected),
          selectable: !!this.selectionMode() && !node.disabled && node.selectable !== false,
          draggable: draggable && !node.disabled && node.draggable !== false,
          icon,
          children,
        };
      });
    return build(this.filteredValue(), 1, null);
  });
  readonly rows = computed<TxTreeRow<T>[]>(() => {
    const rows: TxTreeRow<T>[] = [];
    const walk = (items: TxTreeRow<T>[]) =>
      items.forEach((item) => {
        rows.push(item);
        if (item.expanded) walk(item.children);
      });
    walk(this.tree());
    return rows;
  });
  readonly tabKey = computed(() => {
    const rows = this.rows();
    const focused = this.focusedKey();
    if (focused && rows.some((row) => row.node.key === focused)) return focused;
    return (rows.find((row) => row.selected) ?? rows[0])?.node.key ?? null;
  });
  readonly windowRange = computed(() => {
    const count = this.rows().length;
    if (!this.virtualScroll()) return { start: 0, end: count };
    const size = this.virtualScrollItemSize();
    const tolerance = this.virtualScrollTolerance();
    const viewport = this.viewportHeight() || size * 10;
    const start = Math.max(0, Math.floor(this.scrollTop() / size) - tolerance);
    const end = Math.min(count, Math.ceil((this.scrollTop() + viewport) / size) + tolerance);
    return { start, end };
  });
  readonly visibleRows = computed(() => {
    const { start, end } = this.windowRange();
    return this.rows().slice(start, end);
  });
  readonly spacerBefore = computed(() => this.windowRange().start * this.virtualScrollItemSize());
  readonly spacerAfter = computed(() => (this.rows().length - this.windowRange().end) * this.virtualScrollItemSize());
  readonly emptyText = computed(() => this.emptyMessage() ?? this.translations().emptyMessage);
  readonly showMask = computed(() => this.loading() && this.loadingMode() === 'mask');
  readonly rootDrop = computed(() => this.dropTarget()?.key === null);
  readonly filterContext = computed<TxTreeFilterContext>(() => ({
    $implicit: this.query(),
    query: this.query(),
    filter: (query: string) => this.filterNodes(query),
    reset: () => this.resetFilter(),
  }));

  constructor() {
    effect(() => {
      const fresh: string[] = [];
      walkTree(this.value(), (node) => {
        if (this.seenKeys.has(node.key)) return;
        this.seenKeys.add(node.key);
        if (node.expanded) fresh.push(node.key);
      });
      if (fresh.length) {
        untracked(() => this.expandedKeys.update((keys) => [...keys, ...fresh.filter((key) => !keys.includes(key))]));
      }
    });

    effect(() => {
      if (!this.filtering()) return;
      const filter = this.query();
      const filteredValue = this.filteredValue();
      untracked(() => this.filtered.emit({ filter, filteredValue }));
    });

    afterNextRender(() => {
      if (this.filterInputAutoFocus()) this.filterInput()?.nativeElement.focus();
      this.measure();
    });

    inject(DestroyRef).onDestroy(() => {
      this.anchor?.remove();
      if (this.dragService.state()?.source === this) this.dragService.stop();
    });
  }

  templateFor(node: TxTreeNode<T>) {
    const templates = this.templatesByType();
    return templates.get(node.type ?? '') ?? templates.get('') ?? null;
  }

  nodeContext(row: TxTreeRow<T>): TxTreeNodeContext<T> {
    return { $implicit: row.node, node: row.node, level: row.level, expanded: row.expanded, selected: row.selected, checked: row.checked, partial: row.partial };
  }

  nodeClass(row: TxTreeRow<T>): string {
    return [row.node.styleClass, this.passThrough().node?.class].filter(Boolean).join(' ');
  }

  highlighted(row: TxTreeRow<T>): boolean {
    return row.selected && (!this.checkboxMode() || this.highlightOnSelect());
  }

  checkState(row: TxTreeRow<T>): 'true' | 'false' | 'mixed' {
    return row.checked ? 'true' : row.partial ? 'mixed' : 'false';
  }

  expandAll(): void {
    this.expandedKeys.set(branchKeys(this.value()));
  }

  collapseAll(): void {
    this.expandedKeys.set([]);
  }

  filterNodes(query: string): void {
    this.query.set(query);
  }

  resetFilter(): void {
    this.query.set('');
    const input = this.filterInput()?.nativeElement;
    if (input) input.value = '';
  }

  onFilterInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onFilterKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const key = this.tabKey();
      if (key) this.focusKey(key);
    }
  }

  toggle(row: TxTreeRow<T>, event: Event): void {
    event.stopPropagation();
    if (row.leaf) return;
    if (row.expanded) this.collapse(row, event);
    else this.expand(row, event);
  }

  expand(row: TxTreeRow<T>, event: Event): void {
    if (row.leaf || row.expanded) return;
    if (this.filtering()) {
      this.filterExpanded.update((keys) => new Set([...keys, row.node.key]));
    } else {
      this.expandedKeys.update((keys) => [...keys, row.node.key]);
    }
    if (row.node.leaf === false && row.node.children === undefined) {
      this.pendingKeys.update((keys) => new Set([...keys, row.node.key]));
    }
    this.nodeExpand.emit({ node: row.node, originalEvent: event });
  }

  onCollapseEnd(row: TxTreeRow<T>, event: TransitionEvent): void {
    if (event.target !== event.currentTarget || event.propertyName !== 'grid-template-rows' || row.expanded) return;
    this.mountedKeys.update((keys) => new Set([...keys].filter((key) => key !== row.node.key)));
  }

  collapse(row: TxTreeRow<T>, event: Event): void {
    if (!row.expanded) return;
    this.mountedKeys.update((keys) => new Set([...keys, row.node.key]));
    if (this.filtering()) {
      this.filterExpanded.update((keys) => new Set([...keys].filter((key) => key !== row.node.key)));
    } else {
      this.expandedKeys.update((keys) => keys.filter((key) => key !== row.node.key));
    }
    this.nodeCollapse.emit({ node: row.node, originalEvent: event });
  }

  onNodeClick(row: TxTreeRow<T>, event: MouseEvent | KeyboardEvent): void {
    this.focusedKey.set(row.node.key);
    if (!row.selectable) return;
    if (this.checkboxMode()) {
      this.toggleCheck(row, event);
      return;
    }
    const metaKey = event.metaKey || event.ctrlKey;
    const useMeta = this.metaKeySelection();
    if (this.selectionMode() === 'single') {
      if (row.selected) {
        if (!useMeta || metaKey) {
          this.selection.set(null);
          this.nodeUnselect.emit({ node: row.node, originalEvent: event });
        }
        return;
      }
      this.selection.set(row.node);
      this.nodeSelect.emit({ node: row.node, originalEvent: event });
      return;
    }
    const current = this.currentSelection();
    if (useMeta && !metaKey) {
      const only = current.length === 1 && current[0].key === row.node.key;
      if (only) return;
      this.selection.set([row.node]);
      this.nodeSelect.emit({ node: row.node, originalEvent: event });
      return;
    }
    if (row.selected) {
      this.selection.set(current.filter((node) => node.key !== row.node.key));
      this.nodeUnselect.emit({ node: row.node, originalEvent: event });
    } else {
      this.selection.set(this.inTreeOrder([...current.map((node) => node.key), row.node.key]));
      this.nodeSelect.emit({ node: row.node, originalEvent: event });
    }
  }

  onNodeDoubleClick(row: TxTreeRow<T>, event: MouseEvent): void {
    this.nodeDoubleClick.emit({ node: row.node, originalEvent: event });
  }

  onNodeContextMenu(row: TxTreeRow<T>, event: MouseEvent | KeyboardEvent): void {
    const items = this.contextMenu();
    if (!items?.length) return;
    event.preventDefault();
    event.stopPropagation();
    this.focusedKey.set(row.node.key);
    this.contextMenuSelection.set(row.node);
    this.nodeContextMenuSelect.emit({ node: row.node, originalEvent: event });
    this.menuItems.set(items);
    this.openMenuAt(event);
  }

  onMenuClosed(): void {
    this.menuOpen.set(false);
    this.anchor?.remove();
    this.anchor = null;
    const key = this.focusedKey();
    if (key && !this.host.nativeElement.contains(this.document.activeElement)) this.focusKey(key);
  }

  onTreeFocusIn(event: FocusEvent): void {
    const key = (event.target as HTMLElement).dataset['treeKey'];
    if (key !== undefined && key !== this.focusedKey()) this.focusedKey.set(key);
  }

  onTreeKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') !== 'treeitem' || event.target !== event.currentTarget) return;
    const focused = target.dataset['treeKey'] ?? null;
    if (focused !== this.focusedKey()) this.focusedKey.set(focused);
    const rows = this.rows();
    const index = rows.findIndex((row) => row.node.key === focused);
    const row = rows[index];
    if (!row) return;
    if (event.altKey && this.draggableNodes() && this.droppableNodes() && this.moveByKey(row, event)) {
      event.preventDefault();
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        this.focusIndex(index + 1, event);
        return;
      case 'ArrowUp':
        this.focusIndex(index - 1, event);
        return;
      case 'Home':
        this.focusIndex(0, event);
        return;
      case 'End':
        this.focusIndex(rows.length - 1, event);
        return;
      case 'ArrowRight':
        event.preventDefault();
        if (!row.leaf && !row.expanded) this.expand(row, event);
        else if (row.children.length) this.focusKey(row.children[0].node.key);
        return;
      case 'ArrowLeft':
        event.preventDefault();
        if (row.expanded) this.collapse(row, event);
        else if (row.parentKey) this.focusKey(row.parentKey);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.onNodeClick(row, event);
        return;
      case '*': {
        event.preventDefault();
        const siblings = rows.filter((item) => item.parentKey === row.parentKey && item.level === row.level && !item.leaf && !item.expanded);
        siblings.forEach((item) => this.expand(item, event));
        return;
      }
      case 'ContextMenu':
        this.onNodeContextMenu(row, event);
        return;
      case 'F10':
        if (event.shiftKey) this.onNodeContextMenu(row, event);
        return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const found = this.typeahead.search(
        event.key,
        rows.map((item) => item.node.label),
        index,
      );
      if (found !== null) {
        event.preventDefault();
        this.focusKey(rows[found].node.key);
      }
    }
  }

  onScroll(event: Event): void {
    if (!this.virtualScroll()) return;
    const element = event.target as HTMLElement;
    this.scrollTop.set(element.scrollTop);
    this.viewportHeight.set(element.clientHeight);
  }

  onDragStart(row: TxTreeRow<T>, event: DragEvent): void {
    if (!row.draggable) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    event.dataTransfer?.setData('text/plain', row.node.label);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    this.draggingKey.set(row.node.key);
    this.dragService.start({ node: row.node, scope: this.draggableScope(), source: this });
  }

  onDragOver(row: TxTreeRow<T>, event: DragEvent): void {
    const state = this.dragService.state();
    if (!state || !this.droppableNodes()) return;
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = rect.height ? (event.clientY - rect.top) / rect.height : 0.5;
    const inside = row.node.droppable !== false;
    const position: TxTreeDropPosition = ratio < 0.25 || (!inside && ratio < 0.5) ? 'before' : ratio > 0.75 || !inside ? 'after' : 'inside';
    if (!this.canDrop(state.node, state.source === this, state.scope, row.node.key)) {
      this.dropTarget.set(null);
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    const current = this.dropTarget();
    if (current?.key !== row.node.key || current.position !== position) this.dropTarget.set({ key: row.node.key, position });
  }

  onDragLeave(row: TxTreeRow<T>, event: DragEvent): void {
    const related = event.relatedTarget as Node | null;
    if (related && (event.currentTarget as HTMLElement).contains(related)) return;
    if (this.dropTarget()?.key === row.node.key) this.dropTarget.set(null);
  }

  onRootDragOver(event: DragEvent): void {
    const state = this.dragService.state();
    if (!state || !this.droppableNodes() || !this.canDrop(state.node, state.source === this, state.scope, null)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    if (this.dropTarget()?.key !== null) this.dropTarget.set({ key: null, position: 'inside' });
  }

  onRootDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as Node | null;
    if (related && (event.currentTarget as HTMLElement).contains(related)) return;
    this.dropTarget.set(null);
  }

  onDrop(event: DragEvent): void {
    const state = this.dragService.state();
    const target = this.dropTarget();
    this.dropTarget.set(null);
    if (!state || !target) return;
    event.preventDefault();
    event.stopPropagation();
    this.drop(state.node, state.source, target.key, target.position, event);
    this.dragService.stop();
  }

  onDragEnd(): void {
    this.draggingKey.set(null);
    this.dropTarget.set(null);
    if (this.dragService.state()?.source === this) this.dragService.stop();
  }

  removeDraggedNode(key: string): void {
    this.value.set(removeNode(this.value(), key));
  }

  private canDrop(node: TxTreeNode, sameTree: boolean, scope: TxTreeScope, targetKey: string | null): boolean {
    if (!scopesMatch(sameTree ? (scope ?? this.droppableScope()) : scope, this.droppableScope())) return false;
    if (targetKey === null) return true;
    if (targetKey === node.key) return false;
    return !(sameTree && isDescendantOf(this.value(), node.key, targetKey));
  }

  private drop(node: TxTreeNode, source: TxTreeDragSource, targetKey: string | null, position: TxTreeDropPosition, event: Event): void {
    const dragNode = node as TxTreeNode<T>;
    const sameTree = source === this;
    const base = this.value();
    const next = sameTree ? moveNode(base, dragNode.key, targetKey, position) : insertNode(removeNode(base, dragNode.key), dragNode, targetKey, position);
    const index = siblingsOf(next, dragNode.key).findIndex((item) => item.key === dragNode.key);
    const dropNode = targetKey === null ? null : findNode(base, targetKey);
    const accept = () => {
      if (!sameTree) source.removeDraggedNode(dragNode.key);
      this.value.set(next);
      if (position === 'inside' && targetKey !== null && !this.expandedKeys().includes(targetKey)) {
        this.expandedKeys.update((keys) => [...keys, targetKey]);
      }
    };
    this.nodeDrop.emit({ dragNode, dropNode, position, index, originalEvent: event, accept });
    if (!this.validateDrop()) accept();
  }

  private moveByKey(row: TxTreeRow<T>, event: KeyboardEvent): boolean {
    if (!row.draggable) return false;
    const siblings = this.rows().filter((item) => item.parentKey === row.parentKey && item.level === row.level);
    const position = siblings.findIndex((item) => item.node.key === row.node.key);
    let target: TxTreeDropTarget | null = null;
    if (event.key === 'ArrowUp' && position > 0) target = { key: siblings[position - 1].node.key, position: 'before' };
    else if (event.key === 'ArrowDown' && position < siblings.length - 1) target = { key: siblings[position + 1].node.key, position: 'after' };
    else if (event.key === 'ArrowRight' && position > 0 && siblings[position - 1].node.droppable !== false) target = { key: siblings[position - 1].node.key, position: 'inside' };
    else if (event.key === 'ArrowLeft' && row.parentKey) target = { key: row.parentKey, position: 'after' };
    if (!target) return false;
    this.drop(row.node, this, target.key, target.position, event);
    this.focusKey(row.node.key);
    return true;
  }

  private toggleCheck(row: TxTreeRow<T>, event: Event): void {
    const keys = new Set(this.selectedKeys());
    const check = !row.checked;
    const affected = this.propagateSelectionDown() ? [row.node.key, ...descendantKeys(row.node)] : [row.node.key];
    affected.forEach((key) => (check ? keys.add(key) : keys.delete(key)));
    const ordered = this.propagateSelectionUp() ? normalizeChecked(this.value(), [...keys]) : [...keys];
    this.selection.set(this.inTreeOrder(ordered));
    if (check) this.nodeSelect.emit({ node: row.node, originalEvent: event });
    else this.nodeUnselect.emit({ node: row.node, originalEvent: event });
  }

  private hasCheckedDescendant(node: TxTreeNode<T>, selected: ReadonlySet<string>): boolean {
    return (node.children ?? []).some((child) => selected.has(child.key) || this.hasCheckedDescendant(child, selected));
  }

  private currentSelection(): TxTreeNode<T>[] {
    const selection = this.selection();
    return selection ? (Array.isArray(selection) ? selection : [selection]) : [];
  }

  private inTreeOrder(keys: readonly string[]): TxTreeNode<T>[] {
    const wanted = new Set(keys);
    const nodes: TxTreeNode<T>[] = [];
    walkTree(this.value(), (node) => {
      if (wanted.has(node.key)) nodes.push(node);
    });
    return nodes;
  }

  private focusIndex(index: number, event: Event): void {
    event.preventDefault();
    const rows = this.rows();
    const row = rows[Math.max(0, Math.min(rows.length - 1, index))];
    if (row) this.focusKey(row.node.key);
  }

  focusKey(key: string): void {
    this.focusedKey.set(key);
    if (this.virtualScroll()) this.scrollToKey(key);
    afterNextRender(
      () => {
        const element = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('[data-tree-key]')).find((item) => item.dataset['treeKey'] === key);
        element?.focus({ preventScroll: this.virtualScroll() });
        if (!this.virtualScroll()) element?.scrollIntoView?.({ block: 'nearest' });
      },
      { injector: this.injector },
    );
  }

  private scrollToKey(key: string): void {
    const wrapper = this.wrapper()?.nativeElement;
    const index = this.rows().findIndex((row) => row.node.key === key);
    if (!wrapper || index < 0) return;
    const size = this.virtualScrollItemSize();
    const top = index * size;
    const height = wrapper.clientHeight;
    let next = wrapper.scrollTop;
    if (top < next) next = top;
    else if (top + size > next + height) next = top + size - height;
    wrapper.scrollTop = next;
    this.scrollTop.set(next);
    this.viewportHeight.set(height);
  }

  private measure(): void {
    const wrapper = this.wrapper()?.nativeElement;
    if (wrapper) this.viewportHeight.set(wrapper.clientHeight);
  }

  private openMenuAt(event: MouseEvent | KeyboardEvent): void {
    const menu = this.menu();
    if (!menu) return;
    const point =
      event instanceof MouseEvent && (event.clientX || event.clientY)
        ? { x: event.clientX, y: event.clientY }
        : (() => {
            const rect = (event.target as HTMLElement).getBoundingClientRect();
            return { x: rect.left + 16, y: rect.bottom };
          })();
    menu.hide();
    this.anchor?.remove();
    const anchor = this.document.createElement('div');
    Object.assign(anchor.style, { position: 'fixed', left: `${point.x}px`, top: `${point.y}px`, width: '0', height: '0', pointerEvents: 'none' });
    this.document.body.appendChild(anchor);
    this.anchor = anchor;
    this.menuOpen.set(true);
    menu.show(anchor, 'first', true);
  }
}
