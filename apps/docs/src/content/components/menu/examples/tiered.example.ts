import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxMenu, TxMenuItem, TxMenuTrigger } from '@tectra-ng/ui/menu';

@Component({
  selector: 'menu-tiered-example',
  imports: [TxMenu, TxMenuTrigger, TxButton],
  template: `
    <div class="layout">
      <tx-tiered-menu
        ariaLabel="Message"
        [model]="items"
        (itemSelected)="last.set($event.item.label ?? '')"
      />
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
        <tx-tiered-menu
          #more
          popup
          ariaLabel="More"
          [model]="items"
          (itemSelected)="last.set($event.item.label ?? '')"
        />
        <p class="last">Last action: {{ last() }}</p>
      </div>
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      align-items: flex-start;
      gap: 32px;
    }
    .last {
      margin: 12px 0 0;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuTieredExample {
  readonly last = signal('—');
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
}
