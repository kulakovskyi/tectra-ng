import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'select-button-sizes-example',
  imports: [TxSelectButton],
  template: `
    <div class="stack">
      <tx-select-button
        size="small"
        ariaLabel="Range, small"
        [options]="ranges"
        [(value)]="range"
      />
      <tx-select-button ariaLabel="Range, medium" [options]="ranges" [(value)]="range" />
      <tx-select-button
        size="large"
        ariaLabel="Range, large"
        [options]="ranges"
        [(value)]="range"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonSizesExample {
  readonly ranges = ['Day', 'Week', 'Month', 'Year'];
  readonly range = signal<unknown>('Week');
}
