import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSegmentedBar, TxSegmentedBarItem } from '@tectra-ng/charts/segmented-bar';

@Component({
  selector: 'segmented-bar-tones-example',
  imports: [TxSegmentedBar],
  template: `<tx-segmented-bar [items]="tones" [showValue]="false" ariaLabel="Tones" />`,
  styles: `
    :host {
      display: block;
      max-width: 640px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SegmentedBarTonesExample {
  readonly tones: TxSegmentedBarItem[] = [
    { key: 'primary', label: 'Primary', value: 1, tone: 'primary' },
    { key: 'secondary', label: 'Secondary', value: 1, tone: 'secondary' },
    { key: 'success', label: 'Success', value: 1, tone: 'success' },
    { key: 'info', label: 'Info', value: 1, tone: 'info' },
    { key: 'warn', label: 'Warn', value: 1, tone: 'warn' },
    { key: 'danger', label: 'Danger', value: 1, tone: 'danger' },
    { key: 'neutral', label: 'Neutral', value: 1, tone: 'neutral' },
  ];
}
