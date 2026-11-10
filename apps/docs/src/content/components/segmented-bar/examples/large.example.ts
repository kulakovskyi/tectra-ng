import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSegmentedBar, TxSegmentedBarItem } from '@tectra-ng/charts/segmented-bar';

@Component({
  selector: 'segmented-bar-large-example',
  imports: [TxSegmentedBar],
  template: `<tx-segmented-bar [items]="storage" size="large" ariaLabel="Storage used" />`,
  styles: `
    :host {
      display: block;
      max-width: 640px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SegmentedBarLargeExample {
  readonly storage: TxSegmentedBarItem[] = [
    { key: 'media', label: 'Media', value: 48, tone: 'primary' },
    { key: 'documents', label: 'Documents', value: 22, tone: 'secondary' },
    { key: 'backups', label: 'Backups', value: 18, tone: 'info' },
    { key: 'free', label: 'Free', value: 12, tone: 'neutral' },
  ];
}
