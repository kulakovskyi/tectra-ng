import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPanelMenu, TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';

const exact = { exact: true };
const page = '/components/panel-menu';

@Component({
  selector: 'panel-menu-router-links-example',
  imports: [TxPanelMenu],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <tx-panel-menu variant="sidebar" ariaLabel="Mail" [model]="sidebar" />
      </aside>
      <tx-panel-menu class="panel" [model]="panel" />
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: flex-start;
      width: 100%;
    }
    .sidebar {
      flex: 1 1 220px;
      max-width: 256px;
      padding-bottom: 12px;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
      background: var(--tx-surface-card);
    }
    .panel {
      flex: 1 1 220px;
      max-width: 300px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelMenuRouterLinksExample {
  readonly sidebar: TxPanelMenuItem[] = [
    {
      label: 'Mail',
      items: [
        {
          label: 'Inbox',
          icon: 'inbox',
          routerLink: page,
          queryParams: { folder: 'inbox' },
          routerLinkActiveOptions: exact,
        },
        {
          label: 'Sent',
          icon: 'send',
          routerLink: page,
          queryParams: { folder: 'sent' },
          routerLinkActiveOptions: exact,
        },
        {
          label: 'Labels',
          icon: 'tags',
          items: [
            {
              label: 'Work',
              routerLink: page,
              queryParams: { folder: 'work' },
              routerLinkActiveOptions: exact,
            },
            {
              label: 'Family',
              routerLink: page,
              queryParams: { folder: 'family' },
              routerLinkActiveOptions: exact,
            },
          ],
        },
      ],
    },
  ];
  readonly panel: TxPanelMenuItem[] = [
    {
      label: 'Folders',
      icon: 'folder',
      items: [
        {
          label: 'Inbox',
          icon: 'inbox',
          routerLink: page,
          queryParams: { folder: 'inbox' },
          routerLinkActiveOptions: exact,
        },
        {
          label: 'Work',
          icon: 'briefcase',
          routerLink: page,
          queryParams: { folder: 'work' },
          routerLinkActiveOptions: exact,
        },
      ],
    },
  ];
}
