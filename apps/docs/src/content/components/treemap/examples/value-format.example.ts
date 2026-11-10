import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTreemap, TxTreemapItem } from '@tectra-ng/charts/treemap';

@Component({
  selector: 'treemap-value-format-example',
  imports: [TxTreemap],
  template: `
    <tx-treemap
      [items]="revenue"
      [height]="300"
      [valueFormat]="money"
      [tooltipFormatter]="perMonth"
      ariaLabel="Revenue by plan"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreemapValueFormatExample {
  readonly revenue: TxTreemapItem[] = [
    { label: 'Team', value: 482000 },
    { label: 'Pro', value: 369500 },
    { label: 'Enterprise', value: 288000 },
    { label: 'Starter', value: 94000 },
  ];
  readonly money = (value: number): string => `$${Math.round(value / 1000)}K`;
  readonly perMonth = (value: number): string =>
    `$${Math.round(value / 12).toLocaleString('en-US')} / month`;
}
