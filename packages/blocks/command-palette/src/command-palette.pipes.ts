import { Pipe, PipeTransform } from '@angular/core';
import { TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';
import { TxCommandPaletteItem } from './command-palette.types';

export function filterPaletteItems<T extends TxCommandPaletteItem>(items: readonly T[], query: string | null | undefined): T[] {
  const term = (query ?? '').trim().toLowerCase();
  if (!term) {
    return [...items];
  }
  return items.filter((item) => item.label.toLowerCase().includes(term) || (item.sublabel ?? '').toLowerCase().includes(term));
}

export function menuPaletteItems(menu: readonly TxPanelMenuItem[] | null | undefined, group = 'pages'): TxCommandPaletteItem[] {
  const items = new Map<string, TxCommandPaletteItem>();
  const walk = (nodes: readonly TxPanelMenuItem[], parent: string) => {
    for (const node of nodes) {
      if (node.visible === false || node.disabled || node.separator) {
        continue;
      }
      const label = node.label ?? '';
      if (node.routerLink !== undefined) {
        const path = typeof node.routerLink === 'string' ? node.routerLink : node.routerLink.join('/');
        const id = `page:${path}:${JSON.stringify(node.queryParams ?? {})}`;
        if (!items.has(id)) {
          items.set(id, { id, group, label, sublabel: parent || undefined, icon: node.icon ?? 'file', routerLink: node.routerLink, queryParams: node.queryParams });
        }
      }
      if (node.items?.length) {
        walk(node.items, label);
      }
    }
  };
  for (const section of menu ?? []) {
    if (section.items?.length) {
      walk(section.items, section.label ?? '');
    } else {
      walk([section], '');
    }
  }
  return [...items.values()];
}

@Pipe({ name: 'commandPaletteFilter' })
export class TxCommandPaletteFilterPipe implements PipeTransform {
  transform<T extends TxCommandPaletteItem>(items: readonly T[], query: string | null | undefined): T[] {
    return filterPaletteItems(items, query);
  }
}

@Pipe({ name: 'menuPaletteItems' })
export class TxMenuPaletteItemsPipe implements PipeTransform {
  transform(menu: readonly TxPanelMenuItem[] | null | undefined, group = 'pages'): TxCommandPaletteItem[] {
    return menuPaletteItems(menu, group);
  }
}
