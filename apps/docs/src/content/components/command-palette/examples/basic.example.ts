import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxCommandPalette,
  TxCommandPaletteItem,
  menuPaletteItems,
} from '@tectra-ng/blocks/command-palette';
import { TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';

const MENU: TxPanelMenuItem[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: 'home', routerLink: '/dashboard' },
      { label: 'Reports', icon: 'chart-bar', routerLink: '/reports' },
    ],
  },
  {
    label: 'Domains',
    items: [
      { label: 'All domains', icon: 'globe', routerLink: '/domains' },
      { label: 'Transfers', icon: 'arrow-right-arrow-left', routerLink: '/domains/transfers' },
    ],
  },
];

@Component({
  selector: 'command-palette-basic-example',
  imports: [TxCommandPalette],
  template: `
    <div class="row">
      <tx-command-palette
        placeholder="Search pages and actions"
        localFilter
        [items]="items"
        [groupLabels]="{ pages: 'Pages', actions: 'Actions' }"
        (itemSelect)="last.set($event.label)"
      />
      <span class="note">Opened: {{ last() }}</span>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommandPaletteBasicExample {
  readonly last = signal('nothing yet');
  readonly items: TxCommandPaletteItem[] = [
    ...menuPaletteItems(MENU).map((item) => ({ ...item, routerLink: undefined })),
    {
      id: 'theme',
      group: 'actions',
      label: 'Switch theme',
      icon: 'moon',
      command: () => undefined,
    },
    {
      id: 'invite',
      group: 'actions',
      label: 'Invite a teammate',
      icon: 'user-plus',
      command: () => undefined,
    },
  ];
}
