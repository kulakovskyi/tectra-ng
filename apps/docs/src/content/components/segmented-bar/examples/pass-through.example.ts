import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSegmentedBar, TxSegmentedBarItem } from '@tectra-ng/charts/segmented-bar';

@Component({
  selector: 'segmented-bar-pass-through-example',
  imports: [TxSegmentedBar],
  template: `
    <tx-segmented-bar
      [items]="devices"
      [pt]="{
        legend: { style: { justifyContent: 'center' } },
        dot: { style: { borderRadius: '2px' } },
      }"
      ariaLabel="Visits by device"
    />
  `,
  styles: `
    :host {
      display: block;
      max-width: 520px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SegmentedBarPassThroughExample {
  readonly devices: TxSegmentedBarItem[] = [
    { key: 'desktop', label: 'Desktop', value: 58, tone: 'primary' },
    { key: 'mobile', label: 'Mobile', value: 36, tone: 'info' },
    { key: 'tablet', label: 'Tablet', value: 6, tone: 'neutral' },
  ];
}
