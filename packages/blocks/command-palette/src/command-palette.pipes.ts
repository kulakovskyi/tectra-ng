import { Pipe, PipeTransform } from '@angular/core';
import { TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';
import { TxCommandPaletteItem, TxMenuPaletteIcon, TxMenuPaletteOptions } from './command-palette.types';

/**
 * Keeps the palette items whose label or sublabel contains the query, ignoring case; all items for an
 * empty query.
 */
export function filterPaletteItems<T extends TxCommandPaletteItem>(items: readonly T[], query: string | null | undefined): T[] {
  const term = (query ?? '').trim().toLowerCase();
  if (!term) {
    return [...items];
  }
  return items.filter((item) => item.label.toLowerCase().includes(term) || (item.sublabel ?? '').toLowerCase().includes(term));
}

/**
 * Turns a sidebar menu into palette items for its pages; hidden, disabled and separator entries are
 * left out. The second argument is the group (`pages` by default) or `TxMenuPaletteOptions` with a
 * translate function for the labels and an icon mapping.
 */
export function menuPaletteItems(menu: readonly TxPanelMenuItem[] | null | undefined, options: string | TxMenuPaletteOptions = 'pages'): TxCommandPaletteItem[] {
  const { group = 'pages', translate, icon: mapIcon, defaultIcon = 'file' } = typeof options === 'string' ? { group: options } : options;
  const text = (key: string | undefined) => (key && translate ? translate(key) : (key ?? ''));
  const iconOf = (node: TxPanelMenuItem) => paletteIcon(node, mapIcon) ?? defaultIcon;
  const items = new Map<string, TxCommandPaletteItem>();
  const walk = (nodes: readonly TxPanelMenuItem[], parent: string) => {
    for (const node of nodes) {
      if (node.visible === false || node.disabled || node.separator) {
        continue;
      }
      const label = text(node.label);
      if (node.routerLink !== undefined) {
        const path = typeof node.routerLink === 'string' ? node.routerLink : node.routerLink.join('/');
        const id = `page:${path}:${JSON.stringify(node.queryParams ?? {})}`;
        if (!items.has(id)) {
          items.set(id, { id, group, label, sublabel: parent || undefined, icon: iconOf(node), routerLink: node.routerLink, queryParams: node.queryParams });
        }
      }
      if (node.items?.length) {
        walk(node.items, label);
      }
    }
  };
  for (const section of menu ?? []) {
    if (section.items?.length) {
      walk(section.items, text(section.label));
    } else {
      walk([section], '');
    }
  }
  return [...items.values()];
}

function paletteIcon(node: TxPanelMenuItem, map: TxMenuPaletteIcon | undefined): string | undefined {
  if (typeof map === 'function') {
    return map(node) ?? node.icon;
  }
  return (node.icon && map?.[node.icon]) || node.icon;
}

/** `commandPaletteFilter`: keeps the palette items that match a query, see `filterPaletteItems`. */
@Pipe({ name: 'commandPaletteFilter' })
export class TxCommandPaletteFilterPipe implements PipeTransform {
  transform<T extends TxCommandPaletteItem>(items: readonly T[], query: string | null | undefined): T[] {
    return filterPaletteItems(items, query);
  }
}

/**
 * `menuPaletteItems`: turns a sidebar menu into palette items, see `menuPaletteItems`; pass a new options
 * object when the language changes.
 */
@Pipe({ name: 'menuPaletteItems' })
export class TxMenuPaletteItemsPipe implements PipeTransform {
  transform(menu: readonly TxPanelMenuItem[] | null | undefined, options: string | TxMenuPaletteOptions = 'pages'): TxCommandPaletteItem[] {
    return menuPaletteItems(menu, options);
  }
}
