import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRadialBar, TxRadialBarItem } from '@tectra-ng/charts/radial-bar';

@Component({
  selector: 'radial-bar-legend-example',
  imports: [TxRadialBar],
  template: `<tx-radial-bar
    [items]="items"
    legendVariant="stat"
    legendPosition="bottom"
    ariaLabel="Plan completion by team"
  />`,
  styles: `
    tx-radial-bar {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadialBarLegendExample {
  readonly items: TxRadialBarItem[] = [
    { label: 'Platform', value: 76 },
    { label: 'Mobile', value: 58 },
    { label: 'Web', value: 89 },
  ];
}
