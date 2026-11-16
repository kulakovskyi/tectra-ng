import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'select-button-fluid-example',
  imports: [TxSelectButton],
  template: `
    <tx-select-button
      ariaLabel="Payment method"
      [fluid]="true"
      [options]="methods"
      [(value)]="method"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonFluidExample {
  readonly methods = [
    { label: 'Card', value: 'card', icon: 'credit-card' },
    { label: 'Wallet', value: 'wallet', icon: 'wallet' },
    { label: 'Invoice', value: 'invoice', icon: 'file' },
  ];
  readonly method = signal<unknown>('card');
}
