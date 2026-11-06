import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPanelMenu, TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';

@Component({
  selector: 'panel-menu-design-tokens-example',
  imports: [TxPanelMenu],
  template: `
    <tx-panel-menu
      class="menu"
      [model]="items"
      [dt]="{
        root: { gap: '2px' },
        panel: { borderWidth: '0', background: 'transparent', padding: '0' },
        submenu: { indent: '24px' },
      }"
    />
  `,
  styles: `
    .menu {
      width: 100%;
      max-width: 320px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelMenuDesignTokensExample {
  readonly items: TxPanelMenuItem[] = [
    {
      label: 'Guides',
      icon: 'book',
      expanded: true,
      items: [{ label: 'Getting started' }, { label: 'Theming' }],
    },
    { label: 'Reference', icon: 'code', items: [{ label: 'Components' }, { label: 'Tokens' }] },
  ];
}
