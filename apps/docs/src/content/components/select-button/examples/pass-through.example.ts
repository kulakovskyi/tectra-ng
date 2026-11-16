import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'select-button-pass-through-example',
  imports: [TxSelectButton],
  template: `<tx-select-button ariaLabel="Chart" [pt]="pt" [options]="charts" [(value)]="chart" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonPassThroughExample {
  readonly pt = {
    item: { style: { textTransform: 'uppercase', letterSpacing: '0.04em' } },
    icon: { style: { opacity: '0.7' } },
  };
  readonly charts = [
    { label: 'Line', value: 'line', icon: 'chart-line' },
    { label: 'Bar', value: 'bar', icon: 'chart-bar' },
  ];
  readonly chart = signal<unknown>('line');
}
