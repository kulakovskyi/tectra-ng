import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBarList, TxBarListItem } from '@tectra-ng/charts/bar-list';

@Component({
  selector: 'bar-list-links-example',
  imports: [TxBarList],
  template: `<tx-bar-list [items]="pages" ariaLabel="Top pages" />`,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BarListLinksExample {
  readonly pages: TxBarListItem[] = [
    { label: 'Line Chart', value: 1840, link: '/components/line-chart' },
    { label: 'Column Chart', value: 1320, link: '/components/column-chart' },
    { label: 'Pie Chart', value: 960, link: '/components/pie-chart' },
    { label: 'Bar List', value: 610, link: '/components/bar-list', queryParams: { tab: 'api' } },
  ];
}
