import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'select-button-states-example',
  imports: [TxSelectButton],
  template: `
    <div class="stack">
      <tx-select-button ariaLabel="Delivery" [options]="delivery" [(value)]="method" />
      <tx-select-button
        ariaLabel="Delivery, disabled"
        [disabled]="true"
        [options]="delivery"
        [value]="'pickup'"
      />
      <tx-select-button
        ariaLabel="Delivery, read only"
        [readonly]="true"
        [options]="delivery"
        [value]="'courier'"
      />
      <tx-select-button ariaLabel="Delivery, invalid" [invalid]="true" [options]="delivery" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonStatesExample {
  readonly delivery = [
    { label: 'Pickup', value: 'pickup' },
    { label: 'Courier', value: 'courier' },
    { label: 'Drone', value: 'drone', disabled: true },
    { label: 'Post', value: 'post' },
  ];
  readonly method = signal<unknown>('pickup');
}
