import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPanelMenu, TxPanelMenuExpandedKeys, TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';

@Component({
  selector: 'panel-menu-expanded-example',
  imports: [TxPanelMenu, TxButton],
  template: `
    <div class="actions">
      <button txButton size="small" severity="secondary" (click)="expandAll()">Expand all</button>
      <button txButton size="small" severity="secondary" (click)="keys.set({})">
        Collapse all
      </button>
    </div>
    <tx-panel-menu class="menu" [multiple]="true" [model]="items" [(expandedKeys)]="keys" />
    <p class="status">Open: {{ open() }}</p>
  `,
  styles: `
    .actions {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .menu {
      width: 100%;
      max-width: 320px;
    }
    .status {
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelMenuExpandedExample {
  readonly items: TxPanelMenuItem[] = [
    {
      id: 'mail',
      label: 'Mail',
      icon: 'envelope',
      expanded: true,
      items: [
        { label: 'Inbox' },
        { id: 'folders', label: 'Folders', items: [{ label: 'Work' }, { label: 'Travel' }] },
      ],
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: 'calendar',
      items: [{ label: 'Today' }, { label: 'This week' }],
    },
  ];
  readonly keys = signal<TxPanelMenuExpandedKeys>({ mail: true });
  readonly open = computed(() => {
    const keys = Object.entries(this.keys())
      .filter(([, open]) => open)
      .map(([key]) => key);
    return keys.length ? keys.join(', ') : 'none';
  });

  expandAll(): void {
    this.keys.set({ mail: true, folders: true, calendar: true });
  }
}
