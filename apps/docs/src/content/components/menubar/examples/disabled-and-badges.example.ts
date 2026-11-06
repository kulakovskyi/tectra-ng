import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxMenubar } from '@tectra-ng/ui/menubar';

@Component({
  selector: 'menubar-disabled-and-badges-example',
  imports: [TxMenubar],
  template: `<tx-menubar ariaLabel="Mail" [model]="items" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenubarDisabledAndBadgesExample {
  readonly items: TxMenuItem[] = [
    { label: 'Inbox', icon: 'inbox', badge: 12 },
    { label: 'Drafts', icon: 'file-edit', badge: 3 },
    { label: 'Archive', icon: 'box', disabled: true },
    {
      label: 'More',
      icon: 'ellipsis-h',
      items: [
        { label: 'Spam', badge: 1 },
        { label: 'Trash', disabled: true },
      ],
    },
  ];
}
