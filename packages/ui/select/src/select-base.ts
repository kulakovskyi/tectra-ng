import { CdkConnectedOverlay, ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, Injector, booleanAttribute, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { injectFieldInvalid } from '@tectra/core/forms';
import {
  TxOverlayInsets,
  TxPlacement,
  placementFromPosition,
  txAnimateEnter,
  txAnimateLeave,
  txPositions,
  TxOverlayRoom,
  watchOrigin,
  txScrollStrategy,
} from '@tectra/core/overlay';
import { optionalBoolean } from '@tectra/core/utils';
import { TxOptionsBase } from './options-base';
import { isSelectableRow } from './select-options';
import { TxFieldVariant, TxSelectItem, TxSelectSize } from './select.types';

@Directive()
export abstract class TxSelectBase<T> extends TxOptionsBase<T> {
  readonly placeholder = input<string>('');
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly resetFilterOnHide = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showClear = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly size = input<TxSelectSize>('medium');
  readonly variant = input<TxFieldVariant>('outlined');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly cleared = output<void>();

  readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');
  readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  protected readonly document = inject(DOCUMENT);
  private injector = inject(Injector);
  private overlayInsets = inject(TxOverlayInsets);
  private stopWatchingTrigger: (() => void) | null = null;
  private hasEntered = false;
  private readonly stopWatching = inject(DestroyRef).onDestroy(() => this.stopWatchingTrigger?.());

  readonly isInvalid = injectFieldInvalid(this.invalid);
  private readonly room = new TxOverlayRoom(txPositions('bottom-start', 4));
  private readonly connectedOverlay = viewChild(CdkConnectedOverlay);
  readonly positions = this.room.positions;
  readonly scrollStrategy = txScrollStrategy(this.injector);
  readonly viewportMargin = this.room.viewportMargin;
  readonly isOpen = signal(false);
  readonly isPanelMounted = signal(false);
  readonly panelPlacement = signal<TxPlacement>('bottom-start');
  readonly panelWidth = signal(0);

  abstract readonly hasValue: () => boolean;
  protected abstract clearValue(): void;
  protected abstract onTypeaheadClosed(item: TxSelectItem): void;
  protected abstract handleExtraKey(event: KeyboardEvent, typing: boolean): boolean;
  protected abstract ignoreBoxClick(target: HTMLElement): boolean;

  readonly canClear = computed(() => this.showClear() && this.hasValue() && !this.disabled() && !this.readonly());

  protected isListActive(): boolean {
    return this.isOpen();
  }

  protected get typingTarget(): boolean {
    return false;
  }

  open(): void {
    if (this.disabled() || this.readonly() || this.isOpen()) {
      return;
    }
    this.panelWidth.set(this.box().nativeElement.offsetWidth);
    this.activeIndex.set(-1);
    this.isOpen.set(true);
    this.hasEntered = false;
    this.resetLazyRange();
    this.isPanelMounted.set(true);
    this.room.open(this.overlayInsets.measure());
    this.stopWatchingTrigger = watchOrigin(this.box().nativeElement, this.overlayInsets, {
      insetsChange: (insets) => this.room.follow(insets, this.box().nativeElement, this.panel()?.nativeElement, this.connectedOverlay(), this.injector),
    });
    if (this.lazy() && !this.virtualScroll()) {
      this.requestLazy(0, this.rows().length);
    }
    this.opened.emit();
  }

  close(): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    this.stopWatchingTrigger?.();
    this.stopWatchingTrigger = null;
    if (this.resetFilterOnHide() && this.query()) {
      this.query.set('');
      this.emitFilter();
    }
    this.markTouched();
    this.closed.emit();
    const panel = this.panel()?.nativeElement;
    (panel ? txAnimateLeave(panel, this.panelPlacement()) : Promise.resolve()).then(() => {
      if (!this.isOpen()) {
        this.isPanelMounted.set(false);
      }
    });
  }

  private activateFromNothing(last: boolean): void {
    const rows = this.rows();
    const selected = rows.findIndex((row) => isSelectableRow(row) && row.selected);
    const edge = last ? rows.map((row, index) => (isSelectableRow(row) ? index : -1)).filter((index) => index >= 0).pop() ?? -1 : rows.findIndex(isSelectableRow);
    this.activeIndex.set(selected >= 0 ? selected : edge);
    this.scrollActiveIntoView();
  }

  openFromKeyboard(): void {
    this.open();
    if (this.isOpen() && this.activeIndex() < 0) {
      this.resetActive(true);
    }
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  clear(): void {
    this.clearValue();
    this.cleared.emit();
    this.focusTrigger();
  }

  focusTrigger(): void {
    this.trigger()?.nativeElement.focus();
  }

  onBoxClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.tx-select__clear, .tx-select__chip-remove') || this.ignoreBoxClick(target)) {
      return;
    }
    this.toggle();
    this.focusTrigger();
  }

  onPanelAttach(): void {
    this.filterInput()?.nativeElement.focus();
  }

  onPositionChange(change: ConnectedOverlayPositionChange): void {
    this.panelPlacement.set(placementFromPosition(change.connectionPair) ?? 'bottom-start');
    const panel = this.panel()?.nativeElement;
    if (!this.hasEntered && this.room.fit(this.box().nativeElement, panel, this.connectedOverlay(), this.injector)) {
      return;
    }
    if (!this.hasEntered && panel) {
      this.hasEntered = true;
      txAnimateEnter(panel, this.panelPlacement());
      const selected = this.rows().findIndex((row) => isSelectableRow(row) && row.selected);
      this.optionList()?.scrollToIndex(this.activeIndex() >= 0 ? this.activeIndex() : selected);
    }
  }

  onPanelDetach(): void {
    this.isPanelMounted.set(false);
    this.close();
  }

  onOutsideClick(event: MouseEvent): void {
    if (!this.box().nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
      this.focusTrigger();
    }
  }

  onPanelMousedown(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('input, button, a[href], textarea, select, [tabindex]')) {
      event.preventDefault();
    }
  }

  onPanelFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && !this.panel()?.nativeElement.contains(next) && !this.box().nativeElement.contains(next)) {
      this.close();
    } else if (!next) {
      queueMicrotask(() => {
        const active = this.document.activeElement;
        if (this.isOpen() && (!active || active === this.document.body)) {
          (this.filterInput()?.nativeElement ?? this.trigger()?.nativeElement)?.focus();
        }
      });
    }
  }

  onOptionClick(item: TxSelectItem): void {
    this.activate(item);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.readonly()) {
      return;
    }
    const target = event.target as HTMLElement;
    const typing = target.classList.contains('tx-select__filter-input') || this.typingTarget;
    if (this.handleExtraKey(event, typing)) {
      return;
    }
    const active = this.rows()[this.activeIndex()];
    if (event.key === 'Escape') {
      if (this.isOpen()) {
        event.preventDefault();
        this.close();
        this.focusTrigger();
      }
      return;
    }
    if (event.key === 'Tab') {
      if (!(target.classList.contains('tx-select__filter-input') && this.panelHasFocusable(target, event.shiftKey))) {
        this.close();
      }
      return;
    }
    if (event.key === 'Enter' || (event.key === ' ' && !typing)) {
      event.preventDefault();
      if (!this.isOpen()) {
        this.openFromKeyboard();
      } else if (isSelectableRow(active)) {
        this.activate(active);
      } else {
        this.onEnterWithoutOption();
      }
      return;
    }
    const isListKey = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(event.key);
    if (isListKey && !(typing && (event.key === 'Home' || event.key === 'End'))) {
      event.preventDefault();
      if (!this.isOpen()) {
        this.openFromKeyboard();
        return;
      }
      if (this.activeIndex() < 0 && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        this.activateFromNothing(event.key === 'ArrowUp');
        return;
      }
      this.moveActive(event.key);
      return;
    }
    if (!typing && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const item = this.findByTyping(event.key);
      if (item) {
        if (this.isOpen()) {
          this.scrollActiveIntoView();
        } else {
          this.onTypeaheadClosed(item);
        }
      }
    }
  }

  protected onEnterWithoutOption(): void {
    this.close();
  }

  private panelHasFocusable(from: HTMLElement, backward: boolean): boolean {
    const panel = this.panel()?.nativeElement;
    if (!panel) {
      return false;
    }
    return Array.from(panel.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((element) => element !== from && !element.matches(':disabled'))
      .some((element) =>
        backward
          ? element.compareDocumentPosition(from) & Node.DOCUMENT_POSITION_FOLLOWING
          : from.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
  }
}
