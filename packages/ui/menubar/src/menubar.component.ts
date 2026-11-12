import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxTypeahead, uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxOverlay, TxOverlayRef } from '@tectra-ng/core/overlay';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraMenubarTokens, toStyleObject } from '@tectra-ng/themes';
import { TxBadge } from '@tectra-ng/ui/badge';
import { TxMenuFocus, TxMenuItem, TxMenuItemContext, TxMenuItemEvent, TxMenuList } from '@tectra-ng/ui/menu';
import { TxMenubarEntry, TxMenubarPart } from './menubar.types';
import { MENUBAR_ICON_DEFAULTS } from './menubar.icons';

@Directive({ selector: 'ng-template[txMenubarItem]' })
export class TxMenubarItemTemplate {
  readonly template = inject<TemplateRef<TxMenuItemContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxMenubarItemTemplate, context: unknown): context is TxMenuItemContext {
    return !!context;
  }
}

@Component({
  selector: 'tx-menubar',
  imports: [NgTemplateOutlet, RouterLink, TxIcon, TxBadge, TxMenuList],
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-menubar',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-menubar--mobile]': 'mobile()',
    '[class.tx-menubar--mobile-open]': 'mobile() && mobileOpen()',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  viewProviders: [provideTxIconDefaults(MENUBAR_ICON_DEFAULTS)],
})
export class TxMenubar {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly overlay = inject(TxOverlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly typeahead = new TxTypeahead();
  private readonly baseId = uniqueId('tx-menubar');
  private submenu: { key: string; ref: TxOverlayRef } | null = null;
  private stopWatchingOutside: () => void = () => undefined;

  readonly model = input<TxMenuItem[]>([]);
  readonly autoDisplay = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly breakpoint = input<string>('960px');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraMenubarTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxMenubarPart, TxMenubar> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly itemClick = output<TxMenuItemEvent>();
  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();

  protected readonly itemTemplate = contentChild(TxMenubarItemTemplate);
  private readonly submenuTemplate = viewChild.required<TemplateRef<{ $implicit: TxMenuItem[]; focus: TxMenuFocus }>>('submenu');

  readonly listId = `${this.baseId}-list`;
  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('menubar', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-menubar'), ...this.passThrough().root?.style }));
  readonly submenuPt = computed(() => ({ root: this.passThrough().submenu }));

  readonly entries = computed(() => this.build(this.model(), '', 0));
  readonly openKey = signal<string | null>(null);
  readonly focusKey = signal<string | null>(null);
  readonly mobile = signal(false);
  readonly mobileOpen = signal(false);
  readonly expanded = signal<ReadonlySet<string>>(new Set());
  readonly firstKey = computed(() => this.entries().find((entry) => !entry.item.separator && !entry.item.disabled)?.key ?? null);

  constructor() {
    effect((onCleanup) => {
      const query = `(max-width: ${this.breakpoint()})`;
      const view = this.document.defaultView;
      if (!view?.matchMedia) {
        return;
      }
      const media = view.matchMedia(query);
      const update = () => {
        this.mobile.set(media.matches);
        this.closeSubmenu();
        this.mobileOpen.set(false);
      };
      untracked(update);
      media.addEventListener?.('change', update);
      onCleanup(() => media.removeEventListener?.('change', update));
    });
    inject(DestroyRef).onDestroy(() => {
      this.stopWatchingOutside();
      this.submenu?.ref.close('api');
    });
  }

  hasChildren(entry: TxMenubarEntry): boolean {
    return entry.children.some((child) => !child.item.separator);
  }

  tabIndex(entry: TxMenubarEntry): number {
    return entry.key === (this.focusKey() ?? this.firstKey()) ? 0 : -1;
  }

  isExpanded(entry: TxMenubarEntry): boolean {
    return this.mobile() ? this.expanded().has(entry.key) : this.openKey() === entry.key;
  }

  context(entry: TxMenubarEntry): TxMenuItemContext {
    return { $implicit: entry.item, hasSubmenu: this.hasChildren(entry) };
  }

  childItems(entry: TxMenubarEntry): TxMenuItem[] {
    return entry.item.items ?? [];
  }

  toggleMobile(): void {
    this.mobileOpen.update((open) => !open);
    if (this.mobileOpen()) {
      this.watchOutside();
    } else {
      this.stopWatchingOutside();
    }
  }

  onItemClick(entry: TxMenubarEntry, event: MouseEvent): void {
    if (entry.item.disabled) {
      event.preventDefault();
      return;
    }
    if (this.hasChildren(entry)) {
      if (this.mobile()) {
        this.toggleExpanded(entry);
      } else if (this.openKey() === entry.key) {
        this.closeSubmenu();
      } else {
        this.openSubmenu(entry, event.detail === 0 ? 'first' : null);
      }
      return;
    }
    this.select(entry, event);
  }

  onItemEnter(entry: TxMenubarEntry): void {
    if (this.mobile() || entry.level > 0 || entry.item.disabled) {
      return;
    }
    if (this.openKey() === null && !this.autoDisplay()) {
      return;
    }
    if (this.hasChildren(entry)) {
      this.openSubmenu(entry, null);
    } else {
      this.closeSubmenu();
    }
  }

  onItemFocus(entry: TxMenubarEntry): void {
    this.focusKey.set(entry.key);
  }

  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const entry = this.entryOf(target);
    if (!entry) {
      return;
    }
    if (this.mobile()) {
      this.onMobileKeydown(event, entry);
      return;
    }
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.moveRoot(entry, 1, false);
        return;
      case 'ArrowLeft':
        event.preventDefault();
        this.moveRoot(entry, -1, false);
        return;
      case 'Home':
        event.preventDefault();
        this.focusEntry(this.navigable(this.entries())[0]);
        return;
      case 'End': {
        event.preventDefault();
        const items = this.navigable(this.entries());
        this.focusEntry(items[items.length - 1]);
        return;
      }
      case 'ArrowDown':
      case 'ArrowUp':
        if (this.hasChildren(entry) && !entry.item.disabled) {
          event.preventDefault();
          this.openSubmenu(entry, event.key === 'ArrowDown' ? 'first' : 'last');
        }
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.hasChildren(entry)) {
          this.openSubmenu(entry, 'first');
        } else {
          target.click();
        }
        return;
      case 'Escape':
        this.closeSubmenu();
        return;
      default:
        this.search(event, entry, this.navigable(this.entries()));
    }
  }

  onSubmenuKeydown(event: KeyboardEvent): void {
    const key = this.submenu?.key;
    const entry = this.entries().find((item) => item.key === key);
    if (!entry || event.defaultPrevented) {
      return;
    }
    if (event.key === 'ArrowRight' && !(event.target as HTMLElement).hasAttribute('aria-haspopup')) {
      event.preventDefault();
      this.moveRoot(entry, 1, true);
    }
  }

  onSubmenuLeave(): void {
    const entry = this.entries().find((item) => item.key === this.submenu?.key);
    if (entry) {
      this.moveRoot(entry, -1, true);
    }
  }

  onSubmenuSelected(event: TxMenuItemEvent): void {
    this.closeSubmenu();
    this.itemClick.emit(event);
  }

  closeSubmenu(): void {
    this.submenu?.ref.close('api');
  }

  onFocusIn(event: FocusEvent): void {
    if (!(event.relatedTarget instanceof Node) || !this.host.contains(event.relatedTarget)) {
      this.focused.emit(event);
    }
  }

  onFocusOut(event: FocusEvent): void {
    if (!(event.relatedTarget instanceof Node) || !this.host.contains(event.relatedTarget)) {
      this.blurred.emit(event);
    }
  }

  private select(entry: TxMenubarEntry, event: Event): void {
    const itemEvent: TxMenuItemEvent = { item: entry.item, originalEvent: event };
    entry.item.command?.(itemEvent);
    this.itemClick.emit(itemEvent);
    this.closeSubmenu();
    if (this.mobile()) {
      this.mobileOpen.set(false);
      this.stopWatchingOutside();
    }
  }

  private toggleExpanded(entry: TxMenubarEntry): void {
    this.expanded.update((keys) => {
      const next = new Set(keys);
      if (next.has(entry.key)) {
        [...next].filter((key) => key === entry.key || key.startsWith(`${entry.key}-`)).forEach((key) => next.delete(key));
      } else {
        [...next].filter((key) => this.isSibling(key, entry)).forEach((key) => next.delete(key));
        next.add(entry.key);
      }
      return next;
    });
  }

  private isSibling(key: string, entry: TxMenubarEntry): boolean {
    const parent = entry.key.split('-').slice(0, -1).join('-');
    const keyParent = key.split('-').slice(0, -1).join('-');
    return key !== entry.key && keyParent === parent;
  }

  private openSubmenu(entry: TxMenubarEntry, focus: TxMenuFocus): void {
    if (this.submenu?.key === entry.key) {
      if (focus) {
        this.submenu.ref.element.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
      }
      return;
    }
    this.closeSubmenu();
    const origin = this.elementOf(entry);
    if (!origin) {
      return;
    }
    const ref = this.overlay.open(this.submenuTemplate(), {
      origin,
      viewContainerRef: this.viewContainerRef,
      context: { $implicit: this.childItems(entry), focus },
      placement: 'bottom-start',
      offset: 4,
      layer: 'dropdown',
      closeOnOutsideClick: false,
      restoreFocus: focus !== null,
    });
    this.submenu = { key: entry.key, ref };
    this.openKey.set(entry.key);
    this.watchOutside();
    ref.closed.subscribe(() => {
      if (this.submenu?.ref === ref) {
        this.submenu = null;
        this.openKey.set(null);
        this.stopWatchingOutside();
      }
    });
  }

  private watchOutside(): void {
    this.stopWatchingOutside();
    const listener = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && (this.host.contains(target) || target.closest('tx-menu-list'))) {
        return;
      }
      this.closeSubmenu();
      this.mobileOpen.set(false);
      this.stopWatchingOutside();
    };
    this.document.addEventListener('pointerdown', listener, true);
    this.stopWatchingOutside = () => {
      this.document.removeEventListener('pointerdown', listener, true);
      this.stopWatchingOutside = () => undefined;
    };
  }

  private moveRoot(entry: TxMenubarEntry, delta: 1 | -1, open: boolean): void {
    const items = this.navigable(this.entries());
    const index = items.findIndex((item) => item.key === entry.key);
    const next = items[(index + delta + items.length) % items.length];
    if (!next) {
      return;
    }
    const wasOpen = this.submenu !== null;
    this.closeSubmenu();
    this.focusEntry(next);
    if ((open || wasOpen) && this.hasChildren(next)) {
      this.openSubmenu(next, open ? 'first' : null);
    }
  }

  private onMobileKeydown(event: KeyboardEvent, entry: TxMenubarEntry): void {
    const visible = this.visibleMobileEntries();
    const index = visible.findIndex((item) => item.key === entry.key);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusEntry(visible[(index + 1) % visible.length]);
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.focusEntry(visible[(index - 1 + visible.length) % visible.length]);
        return;
      case 'Home':
        event.preventDefault();
        this.focusEntry(visible[0]);
        return;
      case 'End':
        event.preventDefault();
        this.focusEntry(visible[visible.length - 1]);
        return;
      case 'ArrowRight':
        if (this.hasChildren(entry) && !entry.item.disabled) {
          event.preventDefault();
          if (!this.expanded().has(entry.key)) {
            this.toggleExpanded(entry);
          }
        }
        return;
      case 'ArrowLeft': {
        event.preventDefault();
        if (this.expanded().has(entry.key)) {
          this.toggleExpanded(entry);
          return;
        }
        const parent = this.findEntry(entry.key.split('-').slice(0, -1).join('-'));
        if (parent) {
          this.toggleExpanded(parent);
          this.focusEntry(parent);
        }
        return;
      }
      case 'Enter':
      case ' ':
        event.preventDefault();
        (event.target as HTMLElement).click();
        return;
      case 'Escape':
        this.mobileOpen.set(false);
        this.stopWatchingOutside();
        this.host.querySelector<HTMLElement>('.tx-menubar__button')?.focus();
        return;
      default:
        this.search(event, entry, visible);
    }
  }

  private search(event: KeyboardEvent, entry: TxMenubarEntry, items: TxMenubarEntry[]): void {
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const found = this.typeahead.search(
      event.key,
      items.map((item) => item.item.label ?? ''),
      items.indexOf(entry),
    );
    if (found !== null) {
      this.focusEntry(items[found]);
    }
  }

  private visibleMobileEntries(): TxMenubarEntry[] {
    const result: TxMenubarEntry[] = [];
    const walk = (entries: TxMenubarEntry[]) => {
      for (const entry of this.navigable(entries)) {
        result.push(entry);
        if (this.expanded().has(entry.key)) {
          walk(entry.children);
        }
      }
    };
    walk(this.entries());
    return result;
  }

  private navigable(entries: TxMenubarEntry[]): TxMenubarEntry[] {
    return entries.filter((entry) => !entry.item.separator && !entry.item.disabled);
  }

  private focusEntry(entry: TxMenubarEntry | undefined): void {
    if (!entry) {
      return;
    }
    this.focusKey.set(entry.key);
    this.elementOf(entry)?.focus();
  }

  private elementOf(entry: TxMenubarEntry): HTMLElement | null {
    return this.host.querySelector<HTMLElement>(`#${entry.id}`);
  }

  private entryOf(element: HTMLElement): TxMenubarEntry | undefined {
    const key = element.closest<HTMLElement>('[data-key]')?.dataset['key'];
    return key === undefined ? undefined : this.findEntry(key);
  }

  private findEntry(key: string): TxMenubarEntry | undefined {
    const walk = (entries: TxMenubarEntry[]): TxMenubarEntry | undefined => {
      for (const entry of entries) {
        if (entry.key === key) {
          return entry;
        }
        const found = walk(entry.children);
        if (found) {
          return found;
        }
      }
      return undefined;
    };
    return walk(this.entries());
  }

  private build(items: TxMenuItem[], parent: string, level: number): TxMenubarEntry[] {
    return items
      .filter((item) => item.visible !== false)
      .map((item, index) => {
        const key = parent ? `${parent}-${index}` : `${index}`;
        return { item, key, id: `${this.baseId}-${key}`, level, children: item.items ? this.build(item.items, key, level + 1) : [] };
      });
  }
}
