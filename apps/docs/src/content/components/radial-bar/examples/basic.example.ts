import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRadialBar, TxRadialBarItem } from '@tectra-ng/charts/radial-bar';

@Component({
  selector: 'radial-bar-basic-example',
  imports: [TxRadialBar],
  template: `<tx-radial-bar
    [items]="items"
    totalLabel="Average"
    ariaLabel="Sprint progress by stage"
  />`,
  styles: `
    tx-radial-bar {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadialBarBasicExample {
  readonly items: TxRadialBarItem[] = [
    { label: 'Design', value: 92 },
    { label: 'Build', value: 68 },
    { label: 'Review', value: 45 },
    { label: 'Release', value: 20 },
  ];
}
