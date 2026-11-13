import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, IsActiveMatchOptions, NavigationEnd, Router, RouterLink, containsTree } from '@angular/router';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { injectTxIcons, provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraPanelMenuTokens, toStyleObject } from '@tectra-ng/themes';
import { TxBadge } from '@tectra-ng/ui/badge';
import { filter, map } from 'rxjs';
import { TxPanelMenuItemTemplate } from './panel-menu.templates';
import {
  TxPanelMenuExpandedKeys,
  TxPanelMenuItem,
  TxPanelMenuItemContext,
  TxPanelMenuItemEvent,
  TxPanelMenuPart,
  TxPanelMenuVariant,
} from './panel-menu.types';
import { PANEL_MENU_ICON_DEFAULTS } from './panel-menu.icons';
import { PANEL_MENU_THEME } from './panel-menu.theme';

/** Internal tree node of `tx-panel-menu`: an item with its key, depth, ancestors and children. */
export interface TxPanelMenuNode {
  /** The menu item behind the node. */
  item: TxPanelMenuItem;
  /** Key of the node: the item `id` or its position path; used in `expandedKeys`. */
  key: string;
  /** DOM id of the node element. */
  id: string;
  /** Nesting depth of the node, from `0` at the top. */
  level: number;
  /** Keys of the parent nodes, outermost first. */
  ancestors: string[];
  /** Parent node, or `null` at the top level. */
  parent: TxPanelMenuNode | null;
  /** Child nodes shown in the submenu. */
  children: TxPanelMenuNode[];
  /** Whether the node is a separator line, not an item. */
  separator: boolean;
}

/** Internal render block of `tx-panel-menu`: a top-level node and the nodes shown under it. */
interface TxPanelMenuBlock {
  /** The top-level node of the block. */
  node: TxPanelMenuNode;
  /** Nodes rendered inside the block. */
  tree: TxPanelMenuNode[];
  /** Whether the block shows its node as a section title. */
  titled: boolean;
}

/** How a node navigates: through the router, as a plain URL, or not at all. */
type TxPanelMenuLink = 'router' | 'url' | 'none';

const SUBSET_MATCH: IsActiveMatchOptions = { paths: 'subset', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' };
const EXACT_MATCH: IsActiveMatchOptions = { paths: 'exact', queryParams: 'exact', matrixParams: 'ignored', fragment: 'ignored' };

@Component({
  selector: 'tx-panel-menu',
  imports: [NgTemplateOutlet, RouterLink, TxIcon, TxBadge],
  templateUrl: './panel-menu.component.html',
  styleUrl: './panel-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-panel-menu',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-variant]': 'variant()',
    '[class.tx-panel-menu--collapsed]': 'collapsed() && variant() === "sidebar"',
    '[attr.role]': 'ariaLabel() ? "navigation" : null',
    '[attr.aria-label]': 'ariaLabel() ?? null',
  },
  viewProviders: [provideTxIconDefaults(PANEL_MENU_ICON_DEFAULTS)],
})
export class TxPanelMenu {
  private readonly panelMenuTheme = injectTokens(PANEL_MENU_THEME);

  private readonly router = inject(ActivatedRoute, { optional: true }) ? inject(Router) : null;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly txIconRegistry = injectTxIcons();
  private readonly baseId = uniqueId('tx-panel-menu');

  readonly model = input<TxPanelMenuItem[]>([]);
  readonly variant = input<TxPanelMenuVariant>('panel');
  readonly collapsed = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly expandedKeys = model<TxPanelMenuExpandedKeys>({});
  readonly badgeMax = input<number, unknown>(99, { transform: numberAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraPanelMenuTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxPanelMenuPart, TxPanelMenu> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly itemClick = output<TxPanelMenuItemEvent>();

  protected readonly itemTemplate = contentChild(TxPanelMenuItemTemplate);
  protected readonly focusKey = signal<string | null>(null);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('panelMenu', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-panel-menu'), ...this.passThrough().root?.style }));

  readonly nodes = computed(() => this.build(this.model(), null));
  protected readonly blocks = computed<TxPanelMenuBlock[]>(() =>
    this.nodes().map((node) =>
      this.variant() === 'sidebar' && !node.children.length && !node.separator
        ? { node, tree: [node], titled: false }
        : { node, tree: node.children, titled: true },
    ),
  );

  private readonly url = this.router
    ? toSignal(
        this.router.events.pipe(
          filter((event) => event instanceof NavigationEnd),
          map(() => this.router?.url ?? ''),
        ),
        { initialValue: this.router.url },
      )
    : signal('');

  readonly activeKeys = computed(() => {
    const active = new Set<string>();
    const current = this.currentTree();
    const visit = (nodes: TxPanelMenuNode[]) => {
      for (const node of nodes) {
        if (node.item.active ?? (!!current && this.matches(node.item, current))) {
          active.add(node.key);
        }
        visit(node.children);
      }
    };
    visit(this.nodes());
    return active;
  });

  private readonly activeAncestors = computed(() => {
    const keys = new Set<string>();
    const visit = (nodes: TxPanelMenuNode[]) => {
      for (const node of nodes) {
        if (this.activeKeys().has(node.key)) {
          node.ancestors.forEach((key) => keys.add(key));
        }
        visit(node.children);
      }
    };
    visit(this.nodes());
    return [...keys].sort().join('|');
  });

  constructor() {
    effect(() => {
      const ancestors = this.activeAncestors();
      if (!ancestors) {
        return;
      }
      untracked(() => {
        const open = Object.fromEntries(ancestors.split('|').map((key) => [key, true]));
        const current = this.expandedKeys();
        const next = this.multiple() ? { ...current, ...open } : open;
        if (Object.keys(next).some((key) => current[key] !== next[key]) || (!this.multiple() && Object.keys(current).some((key) => current[key] && !next[key]))) {
          this.expandedKeys.set(next);
        }
      });
    });
  }

  isExpanded(node: TxPanelMenuNode): boolean {
    if (this.variant() === 'sidebar' && node.level === 0) {
      return true;
    }
    return this.expandedKeys()[node.key] ?? node.item.expanded ?? false;
  }

  isActive(node: TxPanelMenuNode): boolean {
    return this.activeKeys().has(node.key);
  }

  toggle(node: TxPanelMenuNode): void {
    if (!node.children.length || node.item.disabled) {
      return;
    }
    const open = !this.isExpanded(node);
    const keys = { ...this.expandedKeys() };
    if (open && !this.multiple() && (this.variant() === 'sidebar' || node.level === 0)) {
      for (const sibling of node.parent ? node.parent.children : this.nodes()) {
        if (sibling !== node) {
          keys[sibling.key] = false;
        }
      }
    }
    keys[node.key] = open;
    this.expandedKeys.set(keys);
  }

  protected linkKind(node: TxPanelMenuNode): TxPanelMenuLink {
    const item = node.item;
    if (node.children.length || item.disabled) {
      return 'none';
    }
    if (item.routerLink !== undefined && this.router) {
      return 'router';
    }
    return item.url !== undefined || item.routerLink !== undefined ? 'url' : 'none';
  }

  protected href(item: TxPanelMenuItem): string {
    if (item.url !== undefined) {
      return item.url;
    }
    const commands = item.routerLink;
    return typeof commands === 'string' ? commands : (commands ?? []).join('/');
  }

  protected routerCommands(item: TxPanelMenuItem): readonly unknown[] | string {
    return item.routerLink ?? [];
  }

  protected iconName(icon: string | undefined): string | null {
    return icon && this.txIconRegistry.has(icon) ? icon : null;
  }

  protected badgeText(item: TxPanelMenuItem): string {
    const badge = item.badge;
    if (badge === undefined || badge === null || badge === '') {
      return '';
    }
    if (this.variant() === 'sidebar' && typeof badge === 'number') {
      if (badge <= 0) {
        return '';
      }
      return badge > this.badgeMax() ? `${this.badgeMax()}+` : String(badge);
    }
    return String(badge);
  }

  protected ariaLevel(node: TxPanelMenuNode): number {
    return Math.max(node.level, 1);
  }

  protected context(node: TxPanelMenuNode): TxPanelMenuItemContext {
    return {
      $implicit: node.item,
      item: node.item,
      level: node.level,
      active: this.isActive(node),
      expanded: node.children.length ? this.isExpanded(node) : false,
      hasSubmenu: node.children.length > 0,
    };
  }

  protected tabKey(tree: TxPanelMenuNode[]): string | null {
    const visible = this.visible(tree).filter((node) => !node.item.disabled);
    const focus = this.focusKey();
    return (visible.find((node) => node.key === focus) ?? visible.find((node) => this.isActive(node)) ?? visible[0])?.key ?? null;
  }

  protected onItemClick(node: TxPanelMenuNode, event: Event): void {
    if (node.item.disabled) {
      event.preventDefault();
      return;
    }
    this.focusKey.set(node.key);
    if (node.children.length) {
      this.toggle(node);
    }
    const itemEvent: TxPanelMenuItemEvent = { item: node.item, originalEvent: event };
    node.item.command?.(itemEvent);
    this.itemClick.emit(itemEvent);
  }

  protected onHeaderKeydown(event: KeyboardEvent): void {
    const headers = Array.from(this.host.querySelectorAll<HTMLElement>('.tx-panel-menu__header')).filter(
      (header) => !header.hasAttribute('disabled') && header.closest('.tx-panel-menu') === this.host,
    );
    const current = headers.indexOf(event.currentTarget as HTMLElement);
    let target: HTMLElement | undefined;
    switch (event.key) {
      case 'ArrowDown':
        target = headers[Math.min(current + 1, headers.length - 1)];
        break;
      case 'ArrowUp':
        target = headers[Math.max(current - 1, 0)];
        break;
      case 'Home':
        target = headers[0];
        break;
      case 'End':
        target = headers[headers.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    target?.focus();
  }

  protected onTreeKeydown(event: KeyboardEvent, tree: TxPanelMenuNode[]): void {
    const element = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
    const visible = this.visible(tree).filter((node) => !node.item.disabled);
    const index = visible.findIndex((node) => node.id === element?.id);
    const node = visible[index];
    if (!node) {
      return;
    }
    let target: TxPanelMenuNode | undefined;
    switch (event.key) {
      case 'ArrowDown':
        target = visible[index + 1];
        break;
      case 'ArrowUp':
        target = visible[index - 1];
        break;
      case 'Home':
        target = visible[0];
        break;
      case 'End':
        target = visible[visible.length - 1];
        break;
      case 'ArrowRight':
        if (node.children.length && !this.isExpanded(node)) {
          this.toggle(node);
        } else if (node.children.length) {
          target = node.children.find((child) => !child.separator && !child.item.disabled);
        }
        break;
      case 'ArrowLeft':
        if (node.children.length && this.isExpanded(node)) {
          this.toggle(node);
        } else if (node.parent && tree.includes(node) === false) {
          target = node.parent;
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        element?.click();
        return;
      default:
        return;
    }
    event.preventDefault();
    if (target) {
      this.focusNode(target);
    }
  }

  private focusNode(node: TxPanelMenuNode): void {
    this.focusKey.set(node.key);
    this.host.querySelector<HTMLElement>(`#${node.id}`)?.focus();
  }

  private visible(nodes: TxPanelMenuNode[]): TxPanelMenuNode[] {
    return nodes.flatMap((node) =>
      node.separator ? [] : [node, ...(node.children.length && this.isExpanded(node) ? this.visible(node.children) : [])],
    );
  }

  private currentTree() {
    const router = this.router;
    const url = this.url();
    return router ? router.parseUrl(url) : null;
  }

  private matches(item: TxPanelMenuItem, current: ReturnType<Router['parseUrl']>): boolean {
    const router = this.router;
    if (!router || item.routerLink === undefined) {
      return false;
    }
    const commands = typeof item.routerLink === 'string' ? [item.routerLink] : [...item.routerLink];
    const target = router.createUrlTree(commands, { queryParams: item.queryParams, fragment: item.fragment });
    const options = item.routerLinkActiveOptions;
    const match = options && 'exact' in options ? (options.exact ? EXACT_MATCH : SUBSET_MATCH) : { ...SUBSET_MATCH, ...options };
    return containsTree(current, target, match);
  }

  private build(items: TxPanelMenuItem[], parent: TxPanelMenuNode | null): TxPanelMenuNode[] {
    return items
      .filter((item) => item.visible !== false)
      .map((item, index) => {
        const key = item.id ?? (parent ? `${parent.key}-${index}` : `${index}`);
        const node: TxPanelMenuNode = {
          item,
          key,
          id: `${this.baseId}-${key.replace(/[^\w-]/g, '_')}`,
          level: parent ? parent.level + 1 : 0,
          ancestors: parent ? [...parent.ancestors, parent.key] : [],
          parent,
          children: [],
          separator: Boolean(item.separator),
        };
        node.children = item.items ? this.build(item.items, node) : [];
        return node;
      });
  }
}
