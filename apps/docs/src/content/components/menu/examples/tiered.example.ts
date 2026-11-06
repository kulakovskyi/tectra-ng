import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxMenu, TxMenuItem, TxMenuItemEvent, TxMenuTrigger } from '@tectra-ng/ui/menu';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'menu-tiered-example',
  imports: [TxMenu, TxMenuTrigger, TxButton],
  template: `
    <div class="layout">
      <tx-tiered-menu ariaLabel="Message" [model]="items" (itemSelected)="run($event)" />
      <div>
        <button
          txButton
          icon="ellipsis-v"
          severity="secondary"
          [outlined]="true"
          [txMenuTrigger]="more"
        >
          More
        </button>
        <tx-tiered-menu #more popup ariaLabel="More" [model]="items" (itemSelected)="run($event)" />
      </div>
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      align-items: flex-start;
      gap: 32px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuTieredExample {
  private readonly toast = inject(TxToastService);
  readonly items: TxMenuItem[] = [
    { label: 'Reply', icon: 'reply' },
    { label: 'Forward', icon: 'send' },
    {
      label: 'Move to',
      icon: 'folder',
      items: [
        { label: 'Inbox', icon: 'inbox' },
        { label: 'Archive', icon: 'box' },
        {
          label: 'Projects',
          icon: 'folder',
          items: [{ label: 'Atlas' }, { label: 'Borealis' }, { label: 'Comet' }],
        },
      ],
    },
    { label: 'Label', icon: 'tag', items: [{ label: 'Important' }, { label: 'Later' }] },
    { separator: true },
    { label: 'Delete', icon: 'trash', severity: 'danger' },
  ];

  run(event: TxMenuItemEvent): void {
    this.toast.info(`Selected: ${event.item.label}`);
  }
}
