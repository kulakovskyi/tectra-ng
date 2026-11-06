import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenu, TxMenuItem } from '@tectra-ng/ui/menu';

@Component({
  selector: 'menu-design-tokens-example',
  imports: [TxMenu],
  template: `
    <tx-menu
      ariaLabel="Workspace"
      [model]="items"
      [dt]="{
        root: { padding: '8px', gap: '4px' },
        item: {
          padding: '10px 14px',
          borderRadius: '10px',
          focusBackground: 'var(--tx-highlight-background)',
        },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuDesignTokensExample {
  readonly items: TxMenuItem[] = [
    { label: 'Overview', icon: 'home' },
    { label: 'Reports', icon: 'chart-bar' },
    { label: 'Settings', icon: 'cog' },
  ];
}
