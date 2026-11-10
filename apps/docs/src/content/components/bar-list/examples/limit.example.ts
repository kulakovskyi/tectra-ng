import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxBarList, TxBarListItem } from '@tectra-ng/charts/bar-list';
import { FormsModule } from '@angular/forms';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'bar-list-limit-example',
  imports: [TxBarList, TxSelect, FormsModule],
  template: `
    <div class="wrap">
      <tx-select class="control" ariaLabel="Rows to show" [options]="limits" [(ngModel)]="limit" />
      <tx-bar-list [items]="browsers" [limit]="limit()" ariaLabel="Visits by browser" />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      justify-items: start;
      gap: 16px;
      max-width: 480px;
    }
    .control {
      width: 160px;
    }
    tx-bar-list {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BarListLimitExample {
  readonly limits = [
    { label: 'Top 3', value: 3 },
    { label: 'Top 5', value: 5 },
    { label: 'Top 10', value: 10 },
  ];
  readonly limit = signal(3);
  readonly browsers: TxBarListItem[] = [
    { label: 'Chrome', value: 5210 },
    { label: 'Safari', value: 2380 },
    { label: 'Firefox', value: 940 },
    { label: 'Edge', value: 810 },
    { label: 'Samsung Internet', value: 420 },
    { label: 'Opera', value: 260 },
    { label: 'Other', value: 180 },
  ];
}
