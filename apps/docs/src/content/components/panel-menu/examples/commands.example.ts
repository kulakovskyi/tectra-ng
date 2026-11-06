import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPanelMenu, TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';

@Component({
  selector: 'panel-menu-commands-example',
  imports: [TxPanelMenu],
  template: `
    <tx-panel-menu class="menu" [model]="items" (itemClick)="last.set($event.item.label ?? '')" />
    <p class="status">{{ status() }} · last click: {{ last() || 'none' }}</p>
  `,
  styles: `
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
export default class PanelMenuCommandsExample {
  readonly status = signal('Nothing done yet');
  readonly last = signal('');
  readonly items: TxPanelMenuItem[] = [
    {
      label: 'Document',
      icon: 'file',
      expanded: true,
      items: [
        { label: 'Save', icon: 'save', command: () => this.status.set('Saved') },
        { label: 'Duplicate', icon: 'copy', command: () => this.status.set('Duplicated') },
        { separator: true },
        { label: 'Delete', icon: 'trash', command: () => this.status.set('Deleted') },
      ],
    },
    { label: 'Print', icon: 'print', command: () => this.status.set('Sent to the printer') },
    { label: 'Help center', icon: 'question-circle', url: 'https://angular.dev', target: '_blank' },
  ];
}
