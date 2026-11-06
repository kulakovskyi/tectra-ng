import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxMenu, TxMenuItem, TxMenuItemEvent } from '@tectra-ng/ui/menu';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'menu-basic-example',
  imports: [TxMenu],
  template: `<tx-menu ariaLabel="Document" [model]="items" (itemSelected)="run($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuBasicExample {
  private readonly toast = inject(TxToastService);
  readonly items: TxMenuItem[] = [
    {
      label: 'Document',
      items: [
        { label: 'New', icon: 'plus', shortcut: '⌘N' },
        { label: 'Duplicate', icon: 'copy', shortcut: '⌘D' },
        { label: 'Print', icon: 'print', disabled: true },
      ],
    },
    {
      label: 'Share',
      items: [
        { label: 'Copy link', icon: 'link' },
        { label: 'Invite people', icon: 'user-plus', badge: 2 },
      ],
    },
    { separator: true },
    { label: 'Delete', icon: 'trash', severity: 'danger' },
  ];

  run(event: TxMenuItemEvent): void {
    this.toast.info(`Selected: ${event.item.label}`);
  }
}
