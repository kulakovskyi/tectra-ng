import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxRelativeTimePipe } from '@tectra-ng/utils/relative-time';

@Component({
  selector: 'relative-time-locale-example',
  imports: [FormsModule, TxSelect, TxRelativeTimePipe],
  providers: [TxLocaleService],
  template: `
    <div class="stack">
      <tx-select
        ariaLabel="Language"
        [options]="languages"
        [ngModel]="locale.locale().code"
        (ngModelChange)="locale.setLocale($event)"
      />
      <span class="hint">Updated {{ updated | txRelativeTime }}</span>
      <span class="hint"
        >Always in Polish: {{ updated | txRelativeTime: { locale: 'pl-PL' } }}</span
      >
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RelativeTimeLocaleExample {
  readonly locale = inject(TxLocaleService);
  readonly languages = [
    { label: 'English', value: 'us' },
    { label: 'Українська', value: 'ua' },
  ];
  readonly updated = new Date(Date.now() - 3 * 24 * 60 * 60_000);
}
