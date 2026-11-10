import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBarList, TxBarListItem } from '@tectra-ng/charts/bar-list';

@Component({
  selector: 'bar-list-basic-example',
  imports: [TxBarList],
  template: `<tx-bar-list [items]="countries" ariaLabel="Visits by country" />`,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BarListBasicExample {
  readonly countries: TxBarListItem[] = [
    { label: 'France', value: 3120 },
    { label: 'Germany', value: 4280 },
    { label: 'Poland', value: 1940 },
    { label: 'Spain', value: 2310 },
    { label: 'Italy', value: 1260 },
    { label: 'Portugal', value: 0 },
  ];
}
