import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCommandPalette, TxCommandPaletteItem } from '@tectra-ng/blocks/command-palette';

@Component({
  selector: 'command-palette-design-tokens-example',
  imports: [TxCommandPalette],
  template: `
    <tx-command-palette
      shortcutKey="u"
      localFilter
      [items]="items"
      [dt]="{
        trigger: { borderRadius: '999px', padding: '0 8px 0 14px' },
        panel: { maxWidth: '480px', borderRadius: '20px' },
        overlay: { background: 'rgb(15 23 42 / 0.2)' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommandPaletteDesignTokensExample {
  readonly items: TxCommandPaletteItem[] = [
    { id: 'profile', group: 'account', label: 'Profile', icon: 'user' },
    { id: 'billing', group: 'account', label: 'Billing', icon: 'credit-card' },
  ];
}
