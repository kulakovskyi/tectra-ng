import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPanelMenu, TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';

@Component({
  selector: 'panel-menu-sidebar-example',
  imports: [TxPanelMenu],
  template: `
    <aside class="sidebar">
      <tx-panel-menu variant="sidebar" ariaLabel="Workspace" [model]="items" />
    </aside>
  `,
  styles: `
    .sidebar {
      width: 100%;
      max-width: 256px;
      padding-bottom: 12px;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
      background: var(--tx-surface-card);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelMenuSidebarExample {
  readonly items: TxPanelMenuItem[] = [
    {
      label: 'Workspace',
      items: [
        { label: 'Overview', icon: 'home' },
        { label: 'Inbox', icon: 'inbox', badge: 128 },
        {
          label: 'Projects',
          icon: 'folder',
          items: [
            { label: 'Website', icon: 'globe' },
            {
              label: 'Mobile app',
              icon: 'mobile',
              items: [{ label: 'Design' }, { label: 'Releases', badge: 4 }],
            },
          ],
        },
        {
          label: 'Reports',
          icon: 'chart-bar',
          items: [{ label: 'Traffic' }, { label: 'Revenue' }],
        },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'Team', icon: 'users', badge: 0 },
        { label: 'Billing', icon: 'credit-card', disabled: true },
        { label: 'Settings', icon: 'cog' },
      ],
    },
  ];
}
