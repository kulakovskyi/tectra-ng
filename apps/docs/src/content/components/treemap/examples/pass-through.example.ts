import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTreemap, TxTreemapItem } from '@tectra-ng/charts/treemap';

@Component({
  selector: 'treemap-pass-through-example',
  imports: [TxTreemap],
  template: `
    <tx-treemap
      [items]="devices"
      [height]="240"
      [pt]="{
        tileLabel: { style: { textTransform: 'uppercase', letterSpacing: '0.04em' } },
      }"
      ariaLabel="Visits by device"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreemapPassThroughExample {
  readonly devices: TxTreemapItem[] = [
    { label: 'Desktop', value: 5820 },
    { label: 'Mobile', value: 4130 },
    { label: 'Tablet', value: 610 },
  ];
}
