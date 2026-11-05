import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxTypeahead, uniqueId } from '@tectra/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra/core/forms';
import { injectTranslations } from '@tectra/core/i18n';
import {
  TxOverlayInsets,
  TxPlacement,
  placementFromPosition,
  txAnimateEnter,
  txAnimateLeave,
  txPositions,
  TxOverlayRoom,
  watchOrigin,
  TxOverlayAnchor,
  txScrollStrategy,
} from '@tectra/core/overlay';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon } from '@tectra/icons';
import { TectraDeepPartial, TectraSelectTokens, toStyleObject } from '@tectra/themes';
import { TxFieldVariant, TxSelectSize, foldText } from '@tectra/ui/select';
import { descendantKeys, findNode, normalizeChecked, parentMap } from './tree';
import { TxTreeBranch, TxTreeNode, TxTreeRow, TxTreeSelectChangeEvent, TxTreeSelectDisplay, TxTreeSelectPart, TxTreeSelectionMode } from './tree-select.types';

@Component({
  selector: 'tx-tree-select',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, TxOverlayAnchor, NgTemplateOutlet, TxIcon],
  templateUrl: './tree-select.component.html',
  styleUrl: './tree-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxTreeSelect), multi: true }],
  host: {
    class: 'tx-tree-select',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
    '[class.tx-tree-select--open]': 'isOpen()',
    '[class.tx-tree-select--disabled]': 'disabled()',
    '[class.tx-tree-select--invalid]': 'isInvalid()',
    '[class.tx-tree-select--readonly]': 'readonly()',
    '[class.tx-tree-select--filled]': 'selectedKeys().length > 0',
  },
})
export class TxTreeSelect extends TxFormControlBase<string | string[]> {
  readonly options = input<readonly TxTreeNode[]>([]);
  readonly selectionMode = input<TxTreeSelectionMode>('single');
  readonly display = input<TxTreeSelectDisplay>('comma');
  readonly expandedKeys = model<string[]>([]);
  readonly filter = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly placeholder = input<string>('');
  readonly showClear = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly scrollHeight = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly size = input<TxSelectSize>('medium');
  readonly variant = input<TxFieldVariant>('outlined');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraSelectTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxTreeSelectPart, TxTreeSelect> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxTreeSelectChangeEvent>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  readonly filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');

  private document = inject(DOCUMENT);
  private injector = inject(Injector);
  private overlayInsets = inject(TxOverlayInsets);
  private typeahead = new TxTypeahead();
  private stopWatching: (() => void) | null = null;
  private hasEntered = false;
  private readonly cleanup = inject(DestroyRef).onDestroy(() => this.stopWatching?.());

  readonly translations = injectTranslations();
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('treeSelect', this, this.pt, this.ptOptions);
  private readonly room = new TxOverlayRoom(txPositions('bottom-start', 4));
  private readonly connectedOverlay = viewChild(CdkConnectedOverlay);
  readonly positions = this.room.positions;
  readonly scrollStrategy = txScrollStrategy(this.injector);
  readonly viewportMargin = this.room.viewportMargin;
  readonly treeId = uniqueId('tx-tree');

  readonly isOpen = signal(false);
  readonly isPanelMounted = signal(false);
  readonly placement = signal<TxPlacement>('bottom-start');
  readonly panelWidth = signal(0);
  readonly query = signal('');
  readonly activeKey = signal<string | null>(null);

  readonly multiple = computed(() => this.selectionMode() !== 'single');
  readonly selectedKeys = computed<string[]>(() => {
    const value = this.value();
    if (Array.isArray(value)) {
      return value;
    }
    return value === null || value === undefined || value === '' ? [] : [value];
  });
  private readonly parents = computed(() => parentMap(this.options()));
  readonly selectedNodes = computed(() =>
    this.selectedKeys()
      .map((key) => findNode(this.options(), key))
      .filter((node): node is TxTreeNode => !!node)
      .filter((node) => this.selectionMode() !== 'checkbox' || !this.parentChecked(node)),
  );
  readonly branches = computed<TxTreeBranch[]>(() => {
    const query = foldText(this.query().trim());
    const expanded = new Set(this.expandedKeys());
    const selected = new Set(this.selectedKeys());
    const matches = (node: TxTreeNode): boolean =>
      foldText(node.label).includes(query) || (node.children ?? []).some((child) => matches(child));
    const build = (nodes: readonly TxTreeNode[], level: number, parent: TxTreeRow | null, shown: boolean): TxTreeBranch[] => {
      const visible = query && !shown ? nodes.filter(matches) : nodes;
      return visible.map((node, index) => {
        const children = node.children ?? [];
        const own = !!query && foldText(node.label).includes(query);
        const open = query ? children.some((child) => matches(child)) || (own && children.length > 0 && expanded.has(node.key)) : expanded.has(node.key);
        const checkable = children.filter((child) => !child.disabled);
        const checkedChildren = checkable.filter((child) => this.isChecked(child, selected)).length;
        const row: TxTreeRow = {
          id: `${this.treeId}-${node.key}`,
          node,
          level: level + 1,
          parent,
          setSize: visible.length,
          posInSet: index + 1,
          hasChildren: children.length > 0,
          expanded: children.length > 0 && open,
          checked: selected.has(node.key),
          partial:
            this.selectionMode() === 'checkbox' &&
            !selected.has(node.key) &&
            (checkedChildren > 0 || checkable.some((child) => this.hasCheckedDescendant(child, selected))),
          selectable: !node.disabled && node.selectable !== false,
        };
        return { row, children: build(children, level + 1, row, shown || own) };
      });
    };
    return build(this.options(), 0, null, false);
  });
  readonly rows = computed<TxTreeRow[]>(() => {
    const rows: TxTreeRow[] = [];
    const walk = (branches: TxTreeBranch[]) =>
      branches.forEach((branch) => {
        rows.push(branch.row);
        if (branch.row.expanded) {
          walk(branch.children);
        }
      });
    walk(this.branches());
    return rows;
  });
  readonly mounted = signal<ReadonlySet<string>>(new Set());
  readonly activeRow = computed(() => this.rows().find((row) => row.node.key === this.activeKey()) ?? null);
  readonly activeId = computed(() => (this.isOpen() ? (this.activeRow()?.id ?? null) : null));
  readonly canClear = computed(() => this.showClear() && this.selectedKeys().length > 0 && !this.disabled() && !this.readonly());
  readonly commaText = computed(() => this.selectedNodes().map((node) => node.label).join(', '));
  readonly emptyText = computed(() => this.emptyMessage() ?? this.translations().emptyMessage);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-select'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly panelStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().panel?.style }));

  open(): void {
    if (this.disabled() || this.readonly() || this.isOpen()) {
      return;
    }
    this.panelWidth.set(this.box().nativeElement.offsetWidth);
    this.revealSelected();
    this.mounted.set(new Set(this.expandedKeys()));
    this.activeKey.set(this.selectedKeys().find((key) => this.rows().some((row) => row.node.key === key)) ?? this.rows()[0]?.node.key ?? null);
    this.isOpen.set(true);
    this.hasEntered = false;
    this.isPanelMounted.set(true);
    this.room.open(this.overlayInsets.measure());
    this.stopWatching = watchOrigin(this.box().nativeElement, this.overlayInsets, {
      insetsChange: (insets) => this.room.follow(insets, this.box().nativeElement, this.panel()?.nativeElement, this.connectedOverlay(), this.injector),
    });
    this.opened.emit();
  }

  close(): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    this.stopWatching?.();
    this.stopWatching = null;
    this.markTouched();
    this.closed.emit();
    const panel = this.panel()?.nativeElement;
    (panel ? txAnimateLeave(panel, this.placement()) : Promise.resolve()).then(() => {
      if (!this.isOpen()) {
        this.isPanelMounted.set(false);
      }
    });
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  onBoxClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.tx-select__clear, .tx-select__chip-remove')) {
      this.toggle();
      this.trigger().nativeElement.focus();
    }
  }

  onAttach(): void {
    this.filterInput()?.nativeElement.focus();
  }

  onPositionChange(change: ConnectedOverlayPositionChange): void {
    this.placement.set(placementFromPosition(change.connectionPair) ?? 'bottom-start');
    const panel = this.panel()?.nativeElement;
    if (!this.hasEntered && this.room.fit(this.box().nativeElement, panel, this.connectedOverlay(), this.injector)) {
      return;
    }
    if (!this.hasEntered && panel) {
      this.hasEntered = true;
      txAnimateEnter(panel, this.placement());
      this.scrollActive();
    }
  }

  onOutsideClick(event: MouseEvent): void {
    if (!this.box().nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  onPanelMousedown(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('input')) {
      event.preventDefault();
    }
  }

  onFilter(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeKey.set(this.rows().find((row) => row.selectable)?.node.key ?? this.rows()[0]?.node.key ?? null);
  }

  onRowClick(row: TxTreeRow, event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.tx-tree-select__toggler')) {
      this.toggleExpanded(row);
      return;
    }
    this.activeKey.set(row.node.key);
    this.pick(row);
  }

  toggleExpanded(row: TxTreeRow): void {
    if (!row.hasChildren) {
      return;
    }
    const keys = new Set(this.expandedKeys());
    if (row.expanded) {
      keys.delete(row.node.key);
    } else {
      keys.add(row.node.key);
    }
    if (!row.expanded) {
      this.mounted.update((mounted) => new Set([...mounted, row.node.key]));
    }
    this.expandedKeys.set([...keys]);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.readonly()) {
      return;
    }
    const typing = (event.target as HTMLElement).classList.contains('tx-select__filter-input');
    if (!this.isOpen()) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        this.open();
      } else if (event.key === 'Backspace' && this.display() === 'chip' && this.multiple()) {
        const last = this.selectedNodes().at(-1);
        if (last) {
          event.preventDefault();
          this.removeNode(last, event);
        }
      }
      return;
    }
    const rows = this.rows();
    const index = rows.findIndex((row) => row.node.key === this.activeKey());
    const row = rows[index];
    const move = (next: number) => {
      const target = rows[Math.max(0, Math.min(rows.length - 1, next))];
      if (target) {
        this.activeKey.set(target.node.key);
        this.scrollActive();
      }
    };
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        this.trigger().nativeElement.focus();
        return;
      case 'Tab':
        this.close();
        return;
      case 'ArrowDown':
        event.preventDefault();
        move(index + 1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        move(index - 1);
        return;
      case 'PageDown':
        event.preventDefault();
        move(index + 10);
        return;
      case 'PageUp':
        event.preventDefault();
        move(index - 10);
        return;
      case 'ArrowRight':
        if (typing || !row) {
          return;
        }
        event.preventDefault();
        if (row.hasChildren && !row.expanded) {
          this.toggleExpanded(row);
        } else if (row.expanded) {
          move(index + 1);
        }
        return;
      case 'ArrowLeft':
        if (typing || !row) {
          return;
        }
        event.preventDefault();
        if (row.expanded) {
          this.toggleExpanded(row);
        } else if (row.parent) {
          this.activeKey.set(row.parent.node.key);
          this.scrollActive();
        }
        return;
      case 'Home':
      case 'End':
        if (!typing) {
          event.preventDefault();
          move(event.key === 'Home' ? 0 : rows.length - 1);
        }
        return;
      case 'Enter':
        event.preventDefault();
        if (row) {
          this.pick(row);
        }
        return;
    }
    if (event.key === ' ' && !typing) {
      event.preventDefault();
      if (row) {
        this.pick(row);
      }
      return;
    }
    if (!typing && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const found = this.typeahead.search(
        event.key,
        rows.map((entry) => entry.node.label),
        index,
      );
      if (found !== null) {
        move(found);
      }
    }
  }

  clear(): void {
    this.commit(null, null);
    this.trigger().nativeElement.focus();
  }

  removeNode(node: TxTreeNode, event: Event): void {
    event.stopPropagation();
    if (this.disabled() || this.readonly()) {
      return;
    }
    if (this.selectionMode() === 'checkbox') {
      this.check(node, false);
    } else {
      this.commit(
        this.selectedKeys().filter((key) => key !== node.key),
        node,
      );
    }
  }

  checkState(row: TxTreeRow): string {
    return row.checked ? 'true' : row.partial ? 'mixed' : 'false';
  }

  private pick(row: TxTreeRow): void {
    if (!row.selectable) {
      if (row.hasChildren) {
        this.toggleExpanded(row);
      }
      return;
    }
    switch (this.selectionMode()) {
      case 'single':
        this.commit(row.node.key, row.node);
        this.close();
        this.trigger().nativeElement.focus();
        return;
      case 'multiple':
        this.commit(row.checked ? this.selectedKeys().filter((key) => key !== row.node.key) : [...this.selectedKeys(), row.node.key], row.node);
        return;
      default:
        this.check(row.node, !row.checked);
    }
  }

  private check(node: TxTreeNode, checked: boolean): void {
    const keys = new Set(this.selectedKeys());
    const affected = [node.key, ...descendantKeys(node)];
    if (checked) {
      affected.forEach((key) => keys.add(key));
    } else {
      affected.forEach((key) => keys.delete(key));
      let parent = this.parents().get(node.key) ?? null;
      while (parent) {
        keys.delete(parent.key);
        parent = this.parents().get(parent.key) ?? null;
      }
    }
    this.commit(normalizeChecked(this.options(), [...keys]), node);
  }

  private commit(value: string | string[] | null, node: TxTreeNode | null): void {
    const next = this.multiple() ? (Array.isArray(value) ? value : value ? [value] : []) : value;
    this.updateValue(next);
    this.changed.emit({ value: next, node });
  }

  private isChecked(node: TxTreeNode, selected: Set<string>): boolean {
    return selected.has(node.key);
  }

  private hasCheckedDescendant(node: TxTreeNode, selected: Set<string>): boolean {
    return (node.children ?? []).some((child) => selected.has(child.key) || this.hasCheckedDescendant(child, selected));
  }

  private parentChecked(node: TxTreeNode): boolean {
    const parent = this.parents().get(node.key);
    return !!parent && this.selectedKeys().includes(parent.key);
  }

  private revealSelected(): void {
    const keys = new Set(this.expandedKeys());
    const size = keys.size;
    for (const key of this.selectedKeys()) {
      let parent = this.parents().get(key) ?? null;
      while (parent) {
        keys.add(parent.key);
        parent = this.parents().get(parent.key) ?? null;
      }
    }
    if (keys.size !== size) {
      this.expandedKeys.set([...keys]);
    }
  }

  private scrollActive(): void {
    const id = this.activeId();
    queueMicrotask(() => (id ? this.document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' }) : undefined));
  }
}
