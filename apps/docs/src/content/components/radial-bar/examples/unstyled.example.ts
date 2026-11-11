import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRadialBar, TxRadialBarItem } from '@tectra-ng/charts/radial-bar';

@Component({
  selector: 'radial-bar-unstyled-example',
  imports: [TxRadialBar],
  template: `<tx-radial-bar [items]="items" unstyled [height]="240" ariaLabel="Unstyled chart" />`,
  styles: `
    tx-radial-bar {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadialBarUnstyledExample {
  readonly items: TxRadialBarItem[] = [
    { label: 'A', value: 70 },
    { label: 'B', value: 35 },
  ];
}
