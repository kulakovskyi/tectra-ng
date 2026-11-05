import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxMenu, TxMenuItem } from '@tectra/ui/menu';

@Component({
  selector: 'menu-basic-example',
  imports: [TxMenu],
  template: `
    <div class="layout">
      <tx-menu
        ariaLabel="Document"
        [model]="items"
        (itemSelected)="last.set($event.item.label ?? '')"
      />
      <p class="last">Last action: {{ last() }}</p>
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      align-items: flex-start;
      gap: 24px;
    }
    .last {
      margin: 0;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuBasicExample {
  readonly last = signal('—');
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
}
