import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRadialBar, TxRadialBarItem } from '@tectra-ng/charts/radial-bar';

@Component({
  selector: 'radial-bar-pass-through-example',
  imports: [TxRadialBar],
  template: `<tx-radial-bar
    [items]="items"
    [pt]="{ track: { style: { 'stroke-dasharray': '2 4' } } }"
    ariaLabel="Budget used"
  />`,
  styles: `
    tx-radial-bar {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadialBarPassThroughExample {
  readonly items: TxRadialBarItem[] = [
    { label: 'Marketing', value: 64 },
    { label: 'Hiring', value: 41 },
  ];
}
