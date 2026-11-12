import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
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
import { RouterLink } from '@angular/router';
import { TxTypeahead, nextListIndex, uniqueId } from '@tectra-ng/core/a11y';
import { injectTokens, TxResolvedPassThrough } from '@tectra-ng/core/config';
import { TxOverlay, TxOverlayRef } from '@tectra-ng/core/overlay';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TxBadge } from '@tectra-ng/ui/badge';
import { TxMenuItem, TxMenuItemContext, TxMenuItemEvent, TxMenuPart } from './menu.types';
import { MENU_ICON_DEFAULTS } from './menu.icons';
import { MENU_THEME } from './menu.theme';

const HOVER_DELAY = 120;

export type TxMenuPanel = 'inline' | 'popup' | 'submenu';
export type TxMenuFocus = 'first' | 'last' | null;
export type TxMenuVariant = 'default' | 'context';

interface TxMenuEntry {
  kind: 'item' | 'separator' | 'group';
  item: TxMenuItem;
  id: string;
}

@Component({
  selector: 'tx-menu-list',
  imports: [NgTemplateOutlet, RouterLink, TxIcon, TxBadge],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-menu',
    role: 'menu',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledBy() ?? null',
    '[attr.data-styled]': '!unstyled() || null',
    '[attr.data-panel]': 'panel()',
    '[attr.data-variant]': 'variant()',
    '[class]': 'pt()?.root?.class',
    '[style]': 'pt()?.root?.style',
  },
  viewProviders: [provideTxIconDefaults(MENU_ICON_DEFAULTS)],
})
export class TxMenuList {
  private readonly menuTheme = injectTokens(MENU_THEME);

  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private document = inject(DOCUMENT);
  private overlay = inject(TxOverlay);
  private viewContainerRef = inject(ViewContainerRef);
  private typeahead = new TxTypeahead();
  private hoverTimer: ReturnType<typeof setTimeout> | undefined;
  private submenu: { entry: TxMenuEntry; ref: TxOverlayRef } | null = null;

  readonly items = input<TxMenuItem[]>([]);
  readonly tiered = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly level = input<number, unknown>(0, { transform: numberAttribute });
  readonly panel = input<TxMenuPanel>('inline');
  readonly variant = input<TxMenuVariant>('default');
  readonly itemTemplate = input<TemplateRef<TxMenuItemContext> | null>(null);
  readonly focusOnInit = input<TxMenuFocus>(null);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly unstyled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly pt = input<TxResolvedPassThrough<TxMenuPart> | undefined>(undefined);

  readonly selected = output<TxMenuItemEvent>();
  readonly leave = output<void>();
  readonly tabbed = output<void>();

  private readonly submenuTemplate = viewChild.required<TemplateRef<{ $implicit: TxMenuItem[]; focus: TxMenuFocus }>>('submenuPanel');
  private readonly listId = uniqueId('tx-menu');
  readonly expanded = signal<string | null>(null);
  readonly roving = signal(0);

  readonly entries = computed(() => this.flatten(this.items()));
  readonly navigable = computed(() => this.entries().filter((entry) => entry.kind === 'item'));

  constructor() {
    afterNextRender(() => {
      const focus = this.focusOnInit();
      if (focus) {
        this.focusAt(focus === 'first' ? this.firstEnabled(1) : this.firstEnabled(-1));
      }
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.hoverTimer);
      this.submenu?.ref.close('api');
    });
  }

  hasSubmenu(item: TxMenuItem): boolean {
    return this.tiered() && Boolean(item.items?.some((child) => child.visible !== false));
  }

  navIndex(entry: TxMenuEntry): number {
    return this.navigable().indexOf(entry);
  }

  tabIndex(entry: TxMenuEntry): number {
    return this.panel() === 'inline' && this.navIndex(entry) === this.roving() ? 0 : -1;
  }

  context(item: TxMenuItem): TxMenuItemContext {
    return { $implicit: item, hasSubmenu: this.hasSubmenu(item) };
  }

  onItemClick(entry: TxMenuEntry, event: MouseEvent): void {
    if (entry.item.disabled) {
      event.preventDefault();
      return;
    }
    this.activate(entry, event, 'first');
  }

  onItemEnter(entry: TxMenuEntry, element: HTMLElement): void {
    clearTimeout(this.hoverTimer);
    if (entry.item.disabled) {
      return;
    }
    element.focus({ preventScroll: true });
    this.roving.set(this.navIndex(entry));
    if (!this.tiered()) {
      return;
    }
    this.hoverTimer = setTimeout(() => {
      if (this.hasSubmenu(entry.item)) {
        this.openSubmenu(entry, null);
      } else {
        this.closeSubmenu();
      }
    }, HOVER_DELAY);
  }

  onItemFocus(entry: TxMenuEntry): void {
    this.roving.set(this.navIndex(entry));
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.target instanceof Element && !this.host.contains(event.target)) {
      return;
    }
    const navigable = this.navigable();
    const elements = this.itemElements();
    const current = elements.indexOf(this.document.activeElement as HTMLElement);
    const entry = navigable[current];
    const next = nextListIndex(event.key, { count: navigable.length, current, isDisabled: (index) => Boolean(navigable[index].item.disabled) });
    if (next !== null && event.key !== 'PageUp' && event.key !== 'PageDown') {
      event.preventDefault();
      this.focusAt(next);
      return;
    }
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (entry) {
          event.preventDefault();
          if (elements[current] instanceof HTMLAnchorElement) {
            elements[current].click();
          } else {
            this.activate(entry, event, 'first');
          }
        }
        return;
      case 'ArrowRight':
        if (entry && this.hasSubmenu(entry.item) && !entry.item.disabled) {
          event.preventDefault();
          this.openSubmenu(entry, 'first');
        }
        return;
      case 'ArrowLeft':
        if (this.level() > 0) {
          event.preventDefault();
          event.stopPropagation();
          this.leave.emit();
        }
        return;
      case 'Tab':
        this.tabbed.emit();
        return;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const found = this.typeahead.search(
            event.key,
            navigable.map((item) => (item.item.disabled ? '' : (item.item.label ?? ''))),
            current,
          );
          if (found !== null) {
            this.focusAt(found);
          }
        }
    }
  }

  closeSubmenu(): void {
    this.submenu?.ref.close('api');
  }

  private activate(entry: TxMenuEntry, event: Event, focus: TxMenuFocus): void {
    if (entry.item.disabled) {
      return;
    }
    if (this.hasSubmenu(entry.item)) {
      this.openSubmenu(entry, focus);
      return;
    }
    const itemEvent: TxMenuItemEvent = { item: entry.item, originalEvent: event };
    entry.item.command?.(itemEvent);
    this.selected.emit(itemEvent);
  }

  private openSubmenu(entry: TxMenuEntry, focus: TxMenuFocus): void {
    if (this.submenu?.entry === entry) {
      if (focus) {
        this.submenu.ref.element.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
      }
      return;
    }
    this.closeSubmenu();
    const origin = this.host.querySelector<HTMLElement>(`#${entry.id}`);
    if (!origin) {
      return;
    }
    const ref = this.overlay.open(this.submenuTemplate(), {
      origin,
      viewContainerRef: this.viewContainerRef,
      context: { $implicit: entry.item.items ?? [], focus },
      placement: 'right-start',
      offset: 2,
      layer: 'dropdown',
      closeOnOutsideClick: false,
      restoreFocus: focus !== null,
    });
    this.submenu = { entry, ref };
    this.expanded.set(entry.id);
    ref.closed.subscribe(() => {
      if (this.submenu?.ref === ref) {
        this.submenu = null;
        this.expanded.set(null);
      }
    });
  }

  onChildSelected(event: TxMenuItemEvent): void {
    this.closeSubmenu();
    this.selected.emit(event);
  }

  onSubmenuLeave(): void {
    const entry = this.submenu?.entry;
    this.closeSubmenu();
    if (entry) {
      this.host.querySelector<HTMLElement>(`#${entry.id}`)?.focus();
    }
  }

  private focusAt(index: number): void {
    const element = this.itemElements()[index];
    if (element) {
      element.focus({ preventScroll: false });
      this.roving.set(index);
    }
  }

  private firstEnabled(direction: 1 | -1): number {
    const navigable = this.navigable();
    const order = direction === 1 ? navigable.map((_, index) => index) : navigable.map((_, index) => navigable.length - 1 - index);
    return order.find((index) => !navigable[index].item.disabled) ?? 0;
  }

  private itemElements(): HTMLElement[] {
    return [...this.host.querySelectorAll<HTMLElement>(':scope > div > [role="menuitem"]')];
  }

  private flatten(items: TxMenuItem[]): TxMenuEntry[] {
    const entries: TxMenuEntry[] = [];
    items
      .filter((item) => item.visible !== false)
      .forEach((item, index) => {
        const id = `${this.listId}-${index}`;
        if (item.separator) {
          entries.push({ kind: 'separator', item, id });
        } else if (!this.tiered() && item.items) {
          entries.push({ kind: 'group', item, id });
          item.items
            .filter((child) => child.visible !== false)
            .forEach((child, childIndex) =>
              entries.push({ kind: child.separator ? 'separator' : 'item', item: child, id: `${id}-${childIndex}` }),
            );
        } else {
          entries.push({ kind: 'item', item, id });
        }
      });
    return entries;
  }
}
