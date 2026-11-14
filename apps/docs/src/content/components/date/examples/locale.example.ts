import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxSelect } from '@tectra-ng/ui/select';
import { TX_DATE_STYLES, TxDatePipe } from '@tectra-ng/utils/date';

@Component({
  selector: 'date-locale-example',
  imports: [FormsModule, TxSelect, TxDatePipe],
  providers: [TxLocaleService],
  template: `
    <div class="stack">
      <tx-select
        ariaLabel="Language"
        [options]="languages"
        [ngModel]="locale.locale().code"
        (ngModelChange)="locale.setLocale($event)"
      />
      <span class="hint">Default: {{ meeting | txDate }}</span>
      <span class="hint">Date and time: {{ meeting | txDate: styles.dateTime }}</span>
      <span class="hint">Long date: {{ meeting | txDate: styles.longDate }}</span>
      <span class="hint">Weekday: {{ meeting | txDate: { weekday: 'long' } }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DateLocaleExample {
  readonly locale = inject(TxLocaleService);
  readonly styles = TX_DATE_STYLES;
  readonly languages = [
    { label: 'English', value: 'us' },
    { label: 'Українська', value: 'ua' },
  ];
  readonly meeting = new Date(2026, 10, 11, 9, 30);
}
