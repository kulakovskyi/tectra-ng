import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import {
  TxDatePipe,
  addDays,
  addMonths,
  calendarDaysBetween,
  endOfDay,
  isExpiringWithin,
  startOfWeek,
  toIsoDay,
} from '@tectra-ng/utils/date';

@Component({
  selector: 'date-calendar-functions-example',
  imports: [FormsModule, TxDatePicker, TxTable, TxTableCell, TxDatePipe],
  template: `
    <div class="layout">
      <tx-datepicker ariaLabel="Day" [showIcon]="true" [(ngModel)]="day" />
      <tx-table ariaLabel="Function results" dataKey="call" [value]="rows()" [columns]="columns">
        <ng-template txTableCell="call" let-value="value"
          ><code>{{ value }}</code></ng-template
        >
        <ng-template txTableCell="result" let-row>{{
          row.date ? (row.date | txDate: 'EEE, dd.MM.yyyy HH:mm') : row.text
        }}</ng-template>
      </tx-table>
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DateCalendarFunctionsExample {
  readonly day = signal<Date | null>(new Date(2026, 0, 31, 15, 20));
  readonly columns: TxTableColumn[] = [
    { field: 'call', header: 'Call' },
    { field: 'result', header: 'Result' },
  ];
  readonly rows = computed<{ call: string; date?: Date; text?: string }[]>(() => {
    const day = this.day() ?? new Date();
    const today = new Date();
    return [
      { call: 'addDays(day, 1)', date: addDays(day, 1) },
      { call: 'addMonths(day, 1)', date: addMonths(day, 1) },
      { call: 'startOfWeek(day)', date: startOfWeek(day) },
      { call: 'endOfDay(day)', date: endOfDay(day) },
      { call: 'toIsoDay(day)', text: toIsoDay(day) },
      { call: 'calendarDaysBetween(today, day)', text: String(calendarDaysBetween(today, day)) },
      { call: 'isExpiringWithin(day)', text: isExpiringWithin(day) ? 'yes' : 'no' },
    ];
  });
}
