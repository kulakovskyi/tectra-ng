import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRadialBar, TxRadialBarItem } from '@tectra-ng/charts/radial-bar';

@Component({
  selector: 'radial-bar-center-example',
  imports: [TxRadialBar],
  template: `<tx-radial-bar
    [items]="items"
    centerValue="value"
    valueFormat="compact"
    legendValues
    legendPosition="right"
    ariaLabel="Steps towards the daily goal"
  />`,
  styles: `
    tx-radial-bar {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadialBarCenterExample {
  readonly items: TxRadialBarItem[] = [
    { label: 'Steps', value: 7420, max: 10000 },
    { label: 'Active minutes', value: 38, max: 60 },
    { label: 'Floors', value: 9, max: 10 },
  ];
}
