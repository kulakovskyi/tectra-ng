import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBarList, TxBarListItem } from '@tectra-ng/charts/bar-list';

@Component({
  selector: 'bar-list-pass-through-example',
  imports: [TxBarList],
  template: `
    <tx-bar-list
      [items]="devices"
      [pt]="{
        label: { style: { fontWeight: '500' } },
        percent: { style: { width: '64px' } },
      }"
      ariaLabel="Visits by device"
    />
  `,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BarListPassThroughExample {
  readonly devices: TxBarListItem[] = [
    { label: 'Desktop', value: 5820 },
    { label: 'Mobile', value: 4130 },
    { label: 'Tablet', value: 610 },
  ];
}
