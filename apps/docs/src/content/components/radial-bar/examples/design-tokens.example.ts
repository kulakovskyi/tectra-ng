import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRadialBar, TxRadialBarItem } from '@tectra-ng/charts/radial-bar';

@Component({
  selector: 'radial-bar-design-tokens-example',
  imports: [TxRadialBar],
  template: `<tx-radial-bar
    [items]="items"
    [dt]="{
      radialBar: { thickness: '0.9', trackColor: 'var(--tx-surface-200)' },
      series: { color1: 'var(--tx-green-500)', color2: 'var(--tx-orange-400)' },
    }"
    ariaLabel="Tasks done and open"
  />`,
  styles: `
    tx-radial-bar {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadialBarDesignTokensExample {
  readonly items: TxRadialBarItem[] = [
    { label: 'Done', value: 72 },
    { label: 'In review', value: 18 },
  ];
}
