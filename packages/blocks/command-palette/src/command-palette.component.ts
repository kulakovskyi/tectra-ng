import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TxFocusTrap, uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraCommandPaletteTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { filterPaletteItems } from './command-palette.pipes';
import { TxCommandPaletteItem, TxCommandPalettePart } from './command-palette.types';
import { COMMAND_PALETTE_ICON_DEFAULTS } from './command-palette.icons';

const MAC = /mac|iphone|ipad/i;

@Component({
  selector: 'tx-command-palette',
  imports: [TxFocusTrap, TxIcon],
  templateUrl: './command-palette.component.html',
  styleUrl: './command-palette.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-command-palette',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-command-palette--compact]': 'compact()',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  viewProviders: [provideTxIconDefaults(COMMAND_PALETTE_ICON_DEFAULTS)],
})
export class TxCommandPalette {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router, { optional: true });
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly layer = viewChild.required<TemplateRef<unknown>>('layer');
  private overlayRef: OverlayRef | null = null;

  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly icon = input<TxIconName | (string & {})>('search');
  readonly items = input<readonly TxCommandPaletteItem[]>([]);
  readonly groupLabels = input<Record<string, string>>({});
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly emptyText = input<string | undefined>(undefined);
  readonly loadingText = input<string | undefined>(undefined);
  readonly minQueryLength = input<number, unknown>(2, { transform: numberAttribute });
  readonly debounceTime = input<number, unknown>(300, { transform: numberAttribute });
  readonly shortcutKey = input<string>('k');
  readonly localFilter = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly compact = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraCommandPaletteTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCommandPalettePart, TxCommandPalette> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly queryChange = output<string>();
  readonly searchChange = output<string>();
  readonly itemSelect = output<TxCommandPaletteItem>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('commandPalette', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  protected readonly id = uniqueId('tx-command-palette');
  protected readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-command-palette'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));

  readonly isOpen = signal(false);
  readonly query = signal('');
  readonly activeIndex = signal(0);
  private readonly mac = signal(false);

  protected readonly name = computed(() => this.label() ?? this.translations().search);
  protected readonly hint = computed(() => this.placeholder() ?? this.name());
  protected readonly shortcutLabel = computed(() => `${this.mac() ? '⌘' : 'Ctrl '}${this.shortcutKey().toUpperCase()}`);
  protected readonly shortcutAria = computed(() => `${this.mac() ? 'Meta' : 'Control'}+${this.shortcutKey().toUpperCase()}`);
  readonly visibleItems = computed(() => (this.localFilter() ? filterPaletteItems(this.items(), this.query()) : [...this.items()]));
  protected readonly activeId = computed(() => (this.visibleItems().length ? `${this.id}-option-${this.activeIndex()}` : null));

  private searchTimer: ReturnType<typeof setTimeout> | undefined;
  private lockedOverflow: string | null = null;

  constructor() {
    afterNextRender(() => {
      const navigator = this.document.defaultView?.navigator;
      this.mac.set(MAC.test(navigator?.platform ?? navigator?.userAgent ?? ''));
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.searchTimer);
      this.unlockScroll();
      this.overlayRef?.dispose();
    });
  }

  open(): void {
    if (this.isOpen()) {
      return;
    }
    this.activeIndex.set(0);
    this.attachLayer();
    this.isOpen.set(true);
    this.lockScroll();
    this.opened.emit();
  }

  close(): void {
    if (!this.isOpen()) {
      return;
    }
    clearTimeout(this.searchTimer);
    this.isOpen.set(false);
    this.query.set('');
    this.activeIndex.set(0);
    this.unlockScroll();
    this.closed.emit();
  }

  select(item: TxCommandPaletteItem): void {
    this.itemSelect.emit(item);
    if (item.routerLink !== undefined && this.router) {
      const commands = typeof item.routerLink === 'string' ? [item.routerLink] : [...item.routerLink];
      void this.router.navigate(commands, { queryParams: item.queryParams });
    }
    item.command?.();
    this.close();
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === this.shortcutKey().toLowerCase()) {
      event.preventDefault();
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
      return;
    }
    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1);
        break;
      case 'Home':
      case 'End':
        if (this.visibleItems().length && event.target instanceof HTMLElement && event.target.getAttribute('role') !== 'combobox') {
          event.preventDefault();
          this.setActive(event.key === 'Home' ? 0 : this.visibleItems().length - 1);
        }
        break;
      case 'Enter': {
        const item = this.visibleItems()[this.activeIndex()];
        if (item) {
          event.preventDefault();
          this.select(item);
        }
        break;
      }
    }
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value.trim());
    this.activeIndex.set(0);
    this.queryChange.emit(this.query());
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      const term = value.trim();
      this.searchChange.emit(term.length >= this.minQueryLength() ? term : '');
    }, this.debounceTime());
  }

  protected setActive(index: number): void {
    this.activeIndex.set(index);
    afterNextRender(
      () => {
        const option = this.document.getElementById(`${this.id}-option-${index}`);
        option?.scrollIntoView?.({ block: 'nearest' });
      },
      { injector: this.injector },
    );
  }

  protected isNewGroup(index: number): boolean {
    const items = this.visibleItems();
    return index === 0 || items[index].group !== items[index - 1].group;
  }

  protected groupLabel(group: string): string {
    return this.groupLabels()[group] ?? group;
  }

  private attachLayer(): void {
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create({ positionStrategy: this.overlay.position().global() });
    }
    if (!this.overlayRef.hasAttached()) {
      this.overlayRef.attach(new TemplatePortal(this.layer(), this.viewContainerRef));
    }
  }

  private move(delta: number): void {
    const total = this.visibleItems().length;
    if (total) {
      this.setActive((this.activeIndex() + delta + total) % total);
    }
  }

  private lockScroll(): void {
    const body = this.document.body;
    if (!body || this.lockedOverflow !== null || !this.host.nativeElement.isConnected) {
      return;
    }
    this.lockedOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
  }

  private unlockScroll(): void {
    if (this.lockedOverflow === null) {
      return;
    }
    this.document.body.style.overflow = this.lockedOverflow;
    this.lockedOverflow = null;
  }
}
