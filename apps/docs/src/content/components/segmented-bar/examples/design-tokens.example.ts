import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSegmentedBar, TxSegmentedBarItem } from '@tectra-ng/charts/segmented-bar';

@Component({
  selector: 'segmented-bar-design-tokens-example',
  imports: [TxSegmentedBar],
  template: `
    <tx-segmented-bar
      [items]="plans"
      [dt]="{
        segmentedBar: {
          trackHeight: '12px',
          trackGap: '4px',
          primaryColor: 'var(--tx-purple-500)',
          secondaryColor: 'var(--tx-purple-300)',
        },
      }"
      ariaLabel="Seats by plan"
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
export default class SegmentedBarDesignTokensExample {
  readonly plans: TxSegmentedBarItem[] = [
    { key: 'team', label: 'Team', value: 64, tone: 'primary' },
    { key: 'pro', label: 'Pro', value: 28, tone: 'secondary' },
    { key: 'free', label: 'Free', value: 40, tone: 'neutral' },
  ];
}
