import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxPanelMenu, TxPanelMenuItem, TxPanelMenuItemTemplate } from '@tectra-ng/ui/panel-menu';
import { TxPill } from '@tectra-ng/ui/pill';

@Component({
  selector: 'panel-menu-template-example',
  imports: [TxPanelMenu, TxPanelMenuItemTemplate, TxIcon, TxPill],
  template: `
    <tx-panel-menu class="menu" [model]="items">
      <ng-template txPanelMenuItem let-item let-expanded="expanded" let-hasSubmenu="hasSubmenu">
        @if (item.icon) {
          <tx-icon [name]="item.icon" />
        }
        <span class="label">{{ item.label }}</span>
        @if (item.data) {
          <tx-pill size="small" tone="info">{{ item.data }}</tx-pill>
        }
        @if (hasSubmenu) {
          <tx-icon [name]="expanded ? 'minus' : 'plus'" />
        }
      </ng-template>
    </tx-panel-menu>
  `,
  styles: `
    .menu {
      width: 100%;
      max-width: 320px;
    }
    .label {
      flex: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelMenuTemplateExample {
  readonly items: TxPanelMenuItem[] = [
    {
      label: 'Integrations',
      icon: 'link',
      expanded: true,
      items: [
        { label: 'Webhooks', icon: 'bolt', data: 'New' },
        { label: 'API keys', icon: 'key' },
      ],
    },
    { label: 'Security', icon: 'shield', items: [{ label: 'Sessions' }, { label: 'Two-factor' }] },
  ];
}
