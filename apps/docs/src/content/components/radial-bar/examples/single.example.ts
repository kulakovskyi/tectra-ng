import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRadialBar, TxRadialBarItem } from '@tectra-ng/charts/radial-bar';

@Component({
  selector: 'radial-bar-single-example',
  imports: [TxRadialBar],
  template: `<tx-radial-bar [items]="items" [height]="240" hole="62%" ariaLabel="Storage used" />`,
  styles: `
    tx-radial-bar {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadialBarSingleExample {
  readonly items: TxRadialBarItem[] = [{ label: 'Storage used', value: 640, max: 1000 }];
}
