import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'select-button-basic-example',
  imports: [TxSelectButton],
  template: `
    <div class="stack">
      <tx-select-button ariaLabel="Billing period" [options]="periods" [(value)]="period" />
      <span class="hint">Value: {{ period() ?? 'none' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonBasicExample {
  readonly periods = [
    { label: 'Monthly', value: 'month' },
    { label: 'Quarterly', value: 'quarter' },
    { label: 'Yearly', value: 'year' },
  ];
  readonly period = signal<unknown>('month');
}
