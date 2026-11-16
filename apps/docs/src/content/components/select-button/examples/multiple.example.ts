import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'select-button-multiple-example',
  imports: [TxSelectButton],
  template: `
    <div class="stack">
      <tx-select-button
        ariaLabel="Working days"
        [multiple]="true"
        [allowEmpty]="false"
        [options]="days"
        [(value)]="workdays"
      />
      <span class="hint">Value: {{ workdays() }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonMultipleExample {
  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly workdays = signal<unknown>(['Mon', 'Tue', 'Wed']);
}
