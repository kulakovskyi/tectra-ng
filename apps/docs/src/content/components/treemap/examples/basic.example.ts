import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTreemap, TxTreemapItem } from '@tectra-ng/charts/treemap';

@Component({
  selector: 'treemap-basic-example',
  imports: [TxTreemap],
  template: `<tx-treemap [items]="spend" ariaLabel="Spend by category" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreemapBasicExample {
  readonly spend: TxTreemapItem[] = [
    { label: 'Hosting', value: 18400 },
    { label: 'Advertising', value: 12600 },
    { label: 'Salaries', value: 9800 },
    { label: 'Software', value: 6200 },
    { label: 'Office', value: 3900 },
    { label: 'Travel', value: 2400 },
    { label: 'Training', value: 1300 },
    { label: 'Other', value: 700 },
  ];
}
