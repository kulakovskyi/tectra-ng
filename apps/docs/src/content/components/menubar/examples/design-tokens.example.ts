import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxMenubar } from '@tectra-ng/ui/menubar';

@Component({
  selector: 'menubar-design-tokens-example',
  imports: [TxMenubar],
  template: `
    <tx-menubar
      ariaLabel="Docs"
      [model]="items"
      [dt]="{
        root: { background: 'var(--tx-surface-ground)', borderColor: 'transparent' },
        item: { borderRadius: '999px' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenubarDesignTokensExample {
  readonly items: TxMenuItem[] = [
    { label: 'Guides', icon: 'book' },
    { label: 'API', icon: 'code', items: [{ label: 'REST' }, { label: 'Webhooks' }] },
    { label: 'Support', icon: 'comments' },
  ];
}
