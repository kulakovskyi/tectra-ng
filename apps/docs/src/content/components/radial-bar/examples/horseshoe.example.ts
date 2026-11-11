import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRadialBar, TxRadialBarItem } from '@tectra-ng/charts/radial-bar';

@Component({
  selector: 'radial-bar-horseshoe-example',
  imports: [TxRadialBar],
  template: `<tx-radial-bar
    [items]="items"
    [startAngle]="-135"
    [endAngle]="135"
    totalLabel="Goals"
    ariaLabel="Quarter goals"
  />`,
  styles: `
    tx-radial-bar {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadialBarHorseshoeExample {
  readonly items: TxRadialBarItem[] = [
    { label: 'Revenue', value: 84 },
    { label: 'New clients', value: 61 },
    { label: 'Retention', value: 93 },
  ];
}
