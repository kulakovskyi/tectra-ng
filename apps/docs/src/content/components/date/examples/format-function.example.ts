import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TX_DATE_STYLES, formatTxDate } from '@tectra-ng/utils/date';

@Component({
  selector: 'date-format-function-example',
  imports: [FormsModule, TxDatePicker, TxTable, TxTableCell],
  template: `
    <div class="layout">
      <tx-datepicker
        ariaLabel="Meeting time"
        [showTime]="true"
        [showIcon]="true"
        [(ngModel)]="meeting"
      />
      <tx-table
        ariaLabel="Meeting time per office"
        dataKey="call"
        [value]="rows()"
        [columns]="columns"
      >
        <ng-template txTableCell="call" let-value="value"
          ><code>{{ value }}</code></ng-template
        >
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
export default class DateFormatFunctionExample {
  readonly meeting = signal<Date | null>(new Date(2026, 10, 11, 9, 30));
  readonly columns: TxTableColumn[] = [
    { field: 'call', header: 'Options' },
    { field: 'text', header: 'Result' },
  ];
  readonly rows = computed(() => {
    const meeting = this.meeting();
    return [
      { call: 'none', text: formatTxDate(meeting) },
      {
        call: "'dd.MM.yyyy HH:mm'",
        text: formatTxDate(meeting, 'dd.MM.yyyy HH:mm'),
      },
      {
        call: 'dateTime, de-DE, Europe/Berlin',
        text: formatTxDate(meeting, TX_DATE_STYLES.dateTime, {
          locale: 'de-DE',
          timezone: 'Europe/Berlin',
        }),
      },
      {
        call: 'time, +0900',
        text: formatTxDate(meeting, TX_DATE_STYLES.time, { timezone: '+0900' }),
      },
      {
        call: "null, empty: 'Not set'",
        text: formatTxDate(null, undefined, { empty: 'Not set' }),
      },
    ];
  });
}
