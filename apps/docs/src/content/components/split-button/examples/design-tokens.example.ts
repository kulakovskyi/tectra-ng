import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra/ui/menu';
import { TxSplitButton } from '@tectra/ui/split-button';

@Component({
  selector: 'split-button-design-tokens-example',
  imports: [TxSplitButton],
  template: `
    <tx-split-button
      label="Deploy"
      icon="send"
      [model]="items"
      [dt]="{ root: { dividerColor: 'var(--tx-surface-0)', dividerWidth: '2px' } }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SplitButtonDesignTokensExample {
  readonly items: TxMenuItem[] = [
    { label: 'Deploy to staging' },
    { label: 'Deploy to production' },
  ];
}
