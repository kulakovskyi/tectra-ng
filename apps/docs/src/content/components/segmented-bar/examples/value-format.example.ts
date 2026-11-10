import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSegmentedBar, TxSegmentedBarItem } from '@tectra-ng/charts/segmented-bar';

@Component({
  selector: 'segmented-bar-value-format-example',
  imports: [TxSegmentedBar],
  template: `
    <tx-segmented-bar
      [items]="spend"
      [valueFormat]="money"
      showPercent
      ariaLabel="Spend by category"
    />
  `,
  styles: `
    :host {
      display: block;
      max-width: 560px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SegmentedBarValueFormatExample {
  readonly spend: TxSegmentedBarItem[] = [
    { key: 'hosting', label: 'Hosting', value: 1840, tone: 'primary' },
    { key: 'tools', label: 'Tools', value: 920, tone: 'info' },
    { key: 'ads', label: 'Ads', value: 610, tone: 'warn' },
  ];
  readonly money = (value: number): string => `$${Math.round(value).toLocaleString('en-US')}`;
}
