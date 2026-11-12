import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
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
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxTypeahead, uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { injectTranslations } from '@tectra-ng/core/i18n';
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
} from '@tectra-ng/core/overlay';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraCascadeSelectTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxFieldVariant, TxSelectSize, readOptionField, sameOptionValue } from '@tectra-ng/ui/select';
import { TxCascadeItem, TxCascadeSelectChangeEvent, TxCascadeSelectPart } from './cascade-select.types';
import { CASCADE_SELECT_ICON_DEFAULTS } from './cascade-select.icons';
import { CASCADE_SELECT_THEME } from './cascade-select.theme';

@Component({
  selector: 'tx-cascade-select',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, TxOverlayAnchor, TxIcon],
  templateUrl: './cascade-select.component.html',
  styleUrl: './cascade-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxCascadeSelect), multi: true }],
  host: {
    class: 'tx-cascade-select',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
    '[class.tx-cascade-select--open]': 'isOpen()',
    '[class.tx-cascade-select--disabled]': 'disabled()',
    '[class.tx-cascade-select--invalid]': 'isInvalid()',
    '[class.tx-cascade-select--readonly]': 'readonly()',
    '[class.tx-cascade-select--filled]': 'hasValue()',
  },
  viewProviders: [provideTxIconDefaults(CASCADE_SELECT_ICON_DEFAULTS)],
})
export class TxCascadeSelect extends TxFormControlBase<unknown> {
  private readonly cascadeSelectTheme = injectTokens(CASCADE_SELECT_THEME);

  readonly options = input<readonly unknown[]>([]);
  readonly optionLabel = input<string>('label');
  readonly optionValue = input<string>('value');
  readonly optionDisabled = input<string>('disabled');
  readonly optionGroupLabel = input<string>('label');
  readonly optionGroupChildren = input<string | readonly string[]>('items');
  readonly dataKey = input<string | undefined>(undefined);
  readonly showPath = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly pathSeparator = input<string>(' / ');
  readonly placeholder = input<string>('');
  readonly showClear = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly size = input<TxSelectSize>('medium');
  readonly variant = input<TxFieldVariant>('outlined');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraCascadeSelectTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCascadeSelectPart, TxCascadeSelect> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxCascadeSelectChangeEvent>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

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
  readonly passThrough = injectPassThrough('cascadeSelect', this, this.pt, this.ptOptions);
  private readonly room = new TxOverlayRoom(txPositions('bottom-start', 4));
  private readonly connectedOverlay = viewChild(CdkConnectedOverlay);
  readonly positions = this.room.positions;
  readonly scrollStrategy = txScrollStrategy(this.injector);
  readonly viewportMargin = this.room.viewportMargin;
  readonly treeId = uniqueId('tx-cascade');
  readonly columnEnter = ['tx-cascade-select__column--enter'];
  readonly noClasses: string[] = [];

  readonly isOpen = signal(false);
  readonly isPanelMounted = signal(false);
  readonly placement = signal<TxPlacement>('bottom-start');
  readonly path = signal<number[]>([]);
  readonly activeLevel = signal(0);

  readonly selectedPath = computed<number[] | null>(() => this.findPath(this.options(), 0));
  readonly columns = computed<TxCascadeItem[][]>(() => {
    const path = this.path();
    const selected = this.selectedPath() ?? [];
    const columns: TxCascadeItem[][] = [];
    let source: readonly unknown[] = this.options();
    for (let level = 0; source.length; level += 1) {
      const items = source.map((option, index) => this.toItem(option, level, index, path, selected));
      columns.push(items);
      const opened = path[level];
      const next = opened === undefined ? undefined : source[opened];
      source = next !== undefined && items[opened]?.group ? this.childrenOf(next, level) : [];
    }
    return columns;
  });
  readonly activeItem = computed(() => this.columns()[this.activeLevel()]?.[this.path()[this.activeLevel()] ?? -1] ?? null);
  readonly activeId = computed(() => (this.isOpen() ? (this.activeItem()?.id ?? null) : null));
  readonly hasValue = computed(() => this.value() !== null && this.value() !== undefined && this.value() !== '');
  readonly label = computed(() => {
    const path = this.selectedPath();
    if (!path) {
      return '';
    }
    const labels: string[] = [];
    let source: readonly unknown[] = this.options();
    path.forEach((index, level) => {
      const option = source[index];
      const last = level === path.length - 1;
      labels.push(String(readOptionField(option, last ? this.optionLabel() : this.optionGroupLabel()) ?? ''));
      source = last ? [] : this.childrenOf(option, level);
    });
    return this.showPath() ? labels.join(this.pathSeparator()) : (labels.at(-1) ?? '');
  });
  readonly canClear = computed(() => this.showClear() && this.hasValue() && !this.disabled() && !this.readonly());
  readonly emptyText = computed(() => this.emptyMessage() ?? this.translations().emptyMessage);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-cascade-select'), ...this.passThrough().root?.style }));
  readonly panelStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-cascade-select'), ...this.passThrough().panel?.style }));

  open(): void {
    if (this.disabled() || this.readonly() || this.isOpen()) {
      return;
    }
    const selected = this.selectedPath();
    const path = selected ? selected : this.firstEnabled(this.options()) >= 0 ? [this.firstEnabled(this.options())] : [];
    this.path.set(path);
    this.activeLevel.set(Math.max(0, path.length - 1));
    this.isOpen.set(true);
    this.hasEntered = false;
    this.isPanelMounted.set(true);
    this.room.open(this.overlayInsets.measure());
    this.stopWatching = watchOrigin(this.box().nativeElement, this.overlayInsets, {
      insetsChange: (insets) => this.room.follow(insets, this.box().nativeElement, this.panel()?.nativeElement, this.connectedOverlay(), this.injector),
      containerScroll: () => this.close(),
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
    if (!(event.target as HTMLElement).closest('.tx-select__clear')) {
      this.toggle();
      this.trigger().nativeElement.focus();
    }
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
    }
  }

  onOutsideClick(event: MouseEvent): void {
    if (!this.box().nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  onPanelMousedown(event: MouseEvent): void {
    event.preventDefault();
  }

  onItemHover(item: TxCascadeItem): void {
    if (!item.disabled) {
      this.focusItem(item.level, item.index);
    }
  }

  onItemClick(item: TxCascadeItem): void {
    if (item.disabled) {
      return;
    }
    this.focusItem(item.level, item.index);
    if (!item.group) {
      this.choose(item);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.readonly()) {
      return;
    }
    if (!this.isOpen()) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        this.open();
      }
      return;
    }
    const level = this.activeLevel();
    const column = this.columns()[level] ?? [];
    const index = this.path()[level] ?? -1;
    const item = column[index];
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        return;
      case 'Tab':
        this.close();
        return;
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Home':
      case 'End': {
        event.preventDefault();
        const next = this.step(column, index, event.key);
        if (next >= 0) {
          this.focusItem(level, next);
        }
        return;
      }
      case 'ArrowRight':
        event.preventDefault();
        if (item?.group) {
          this.enter(item);
        }
        return;
      case 'ArrowLeft':
        event.preventDefault();
        if (level > 0) {
          this.path.update((path) => path.slice(0, level));
          this.activeLevel.set(level - 1);
          this.scrollActive();
        }
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (item?.group) {
          this.enter(item);
        } else if (item && !item.disabled) {
          this.choose(item);
        }
        return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const found = this.typeahead.search(
        event.key,
        column.map((entry) => (entry.disabled ? '' : entry.label)),
        index,
      );
      if (found !== null) {
        this.focusItem(level, found);
      }
    }
  }

  clear(): void {
    this.updateValue(null);
    this.changed.emit({ value: null, option: null, path: [] });
    this.trigger().nativeElement.focus();
  }

  private enter(item: TxCascadeItem): void {
    const children = this.columns()[item.level + 1] ?? [];
    const first = children.findIndex((child) => !child.disabled);
    if (first >= 0) {
      this.path.update((path) => [...path.slice(0, item.level + 1), first]);
      this.activeLevel.set(item.level + 1);
      this.scrollActive();
    }
  }

  private focusItem(level: number, index: number): void {
    this.path.update((path) => [...path.slice(0, level), index]);
    this.activeLevel.set(level);
    this.scrollActive();
  }

  private choose(item: TxCascadeItem): void {
    const options: unknown[] = [];
    let source: readonly unknown[] = this.options();
    this.path()
      .slice(0, item.level + 1)
      .forEach((index, level) => {
        options.push(source[index]);
        source = this.childrenOf(source[index], level);
      });
    this.updateValue(item.value);
    this.changed.emit({ value: item.value, option: item.option, path: options });
    this.close();
    this.trigger().nativeElement.focus();
  }

  private step(column: TxCascadeItem[], index: number, key: string): number {
    const enabled = column.map((item, position) => (item.disabled ? -1 : position)).filter((position) => position >= 0);
    if (!enabled.length) {
      return -1;
    }
    if (key === 'Home') {
      return enabled[0];
    }
    if (key === 'End') {
      return enabled[enabled.length - 1];
    }
    const forward = key === 'ArrowDown';
    const next = forward ? enabled.find((position) => position > index) : [...enabled].reverse().find((position) => position < index);
    return next ?? (forward ? enabled[0] : enabled[enabled.length - 1]);
  }

  private childrenOf(option: unknown, level: number): readonly unknown[] {
    const fields = this.optionGroupChildren();
    const field = typeof fields === 'string' ? fields : (fields[level] ?? fields[fields.length - 1]);
    const children = readOptionField(option, field);
    return Array.isArray(children) ? children : [];
  }

  private toItem(option: unknown, level: number, index: number, path: number[], selected: number[]): TxCascadeItem {
    const group = this.childrenOf(option, level).length > 0;
    return {
      id: `${this.treeId}-${[...path.slice(0, level), index].join('-')}`,
      label: String(readOptionField(option, group ? this.optionGroupLabel() : this.optionLabel()) ?? ''),
      value: group ? null : readOptionField(option, this.optionValue()),
      option,
      level,
      index,
      group,
      disabled: !!(option && typeof option === 'object' && readOptionField(option, this.optionDisabled())),
      selected: !group && selected.length === level + 1 && selected[level] === index && path.slice(0, level).every((position, depth) => position === selected[depth]),
      onPath: path[level] === index,
    };
  }

  private findPath(options: readonly unknown[], level: number): number[] | null {
    if (!this.hasValue()) {
      return null;
    }
    for (let index = 0; index < options.length; index += 1) {
      const option = options[index];
      const children = this.childrenOf(option, level);
      if (children.length) {
        const inner = this.findPath(children, level + 1);
        if (inner) {
          return [index, ...inner];
        }
      } else if (sameOptionValue(readOptionField(option, this.optionValue()), this.value(), this.dataKey())) {
        return [index];
      }
    }
    return null;
  }

  private firstEnabled(options: readonly unknown[]): number {
    return options.findIndex((option) => !(option && typeof option === 'object' && readOptionField(option, this.optionDisabled())));
  }

  private scrollActive(): void {
    queueMicrotask(() => {
      const id = this.activeId();
      if (id) {
        this.document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' });
      }
    });
  }
}
