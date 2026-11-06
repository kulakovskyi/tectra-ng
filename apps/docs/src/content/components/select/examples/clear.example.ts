import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxSelect, TxSelectChangeEvent } from '@tectra-ng/ui/select';

@Component({
  selector: 'select-clear-example',
  imports: [TxSelect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-select
        [options]="statuses"
        [formControl]="status"
        [showClear]="true"
        [placeholder]="'Any status'"
        (changed)="onChange($event)"
      />
      <span class="hint">Last change: {{ last() }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectClearExample {
  readonly statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Archived', value: 'archived' },
  ];
  readonly status = new FormControl<string | null>('active');
  readonly last = signal('—');

  onChange(event: TxSelectChangeEvent): void {
    this.last.set(event.value === null ? 'cleared' : String(event.value));
  }
}
