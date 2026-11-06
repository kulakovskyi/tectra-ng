import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInputNumber } from '@tectra-ng/ui/input-number';

@Component({
  selector: 'input-number-locale-example',
  imports: [FormsModule, TxInputNumber, TxButton],
  template: `
    <div class="row">
      <tx-input-number ariaLabel="Budget" [maxFractionDigits]="2" [(ngModel)]="budget" />
      <button txButton size="small" severity="secondary" [outlined]="true" (click)="toggle()">
        Locale: {{ localeService.locale().code }}
      </button>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputNumberLocaleExample {
  readonly localeService = inject(TxLocaleService);
  budget = 25000.75;

  toggle(): void {
    this.localeService.setLocale(this.localeService.locale().code === 'us' ? 'ua' : 'us');
  }
}
