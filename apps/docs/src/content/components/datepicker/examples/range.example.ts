import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-range-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <div class="stack">
      <tx-datepicker
        ariaLabel="Report period"
        placeholder="Report period"
        selectionMode="range"
        [showIcon]="true"
        [showClear]="true"
        [readonlyInput]="true"
        [(ngModel)]="period"
      />
      <span class="hint">{{ summary() }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerRangeExample {
  readonly period = signal<(Date | null)[] | null>(null);
  readonly summary = computed(() => {
    const [start, end] = this.period() ?? [];
    if (!start) return 'Pick the first day.';
    if (!end) return 'Now pick the last day.';
    return `${Math.round((end.getTime() - start.getTime()) / 86400000) + 1} days`;
  });
}
