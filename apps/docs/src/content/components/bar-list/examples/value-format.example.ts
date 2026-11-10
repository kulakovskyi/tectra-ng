import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBarList, TxBarListItem } from '@tectra-ng/charts/bar-list';

@Component({
  selector: 'bar-list-value-format-example',
  imports: [TxBarList],
  template: `
    <div class="grid">
      <tx-bar-list [items]="sessions" valueFormat="compact" ariaLabel="Sessions by channel" />
      <tx-bar-list [items]="revenue" [valueFormat]="money" ariaLabel="Revenue by plan" />
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 32px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BarListValueFormatExample {
  readonly sessions: TxBarListItem[] = [
    { label: 'Organic', value: 128400 },
    { label: 'Paid', value: 64250 },
    { label: 'Social', value: 31800 },
    { label: 'Email', value: 12900 },
  ];
  readonly revenue: TxBarListItem[] = [
    { label: 'Team', value: 48200 },
    { label: 'Pro', value: 36950 },
    { label: 'Starter', value: 9400 },
  ];
  readonly money = (value: number): string => `$${Math.round(value).toLocaleString('en-US')}`;
}
