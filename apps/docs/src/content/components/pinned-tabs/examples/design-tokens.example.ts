import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPinnedTabs } from '@tectra-ng/blocks/pinned-tabs';

@Component({
  selector: 'pinned-tabs-design-tokens-example',
  imports: [TxPinnedTabs],
  template: `
    <tx-pinned-tabs
      stateKey="docs-pinned-tabs-regions"
      ariaLabel="Regions"
      [options]="regions"
      [(selected)]="selected"
      [dt]="{ root: { gap: '16px' } }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PinnedTabsDesignTokensExample {
  readonly regions = [
    { value: 'eu', label: 'Europe' },
    { value: 'na', label: 'North America' },
    { value: 'apac', label: 'Asia Pacific' },
  ];
  readonly selected = signal<readonly string[]>([]);
}
