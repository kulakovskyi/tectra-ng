import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxNumberPipe } from '@tectra-ng/utils/number';

@Component({
  selector: 'number-locale-example',
  imports: [FormsModule, TxSelect, TxNumberPipe],
  providers: [TxLocaleService],
  template: `
    <div class="stack">
      <tx-select
        ariaLabel="Language"
        [options]="languages"
        [ngModel]="locale.locale().code"
        (ngModelChange)="locale.setLocale($event)"
      />
      <span class="hint">Revenue: {{ revenue | txNumber: { maximumFractionDigits: 2 } }}</span>
      <span class="hint">Always in English: {{ revenue | txNumber: { locale: 'en-US' } }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NumberLocaleExample {
  readonly locale = inject(TxLocaleService);
  readonly languages = [
    { label: 'English', value: 'us' },
    { label: 'Українська', value: 'ua' },
  ];
  readonly revenue = 1284730.456;
}
