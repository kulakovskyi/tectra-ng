import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartCurrencyFormat, TxChartSeries } from '@tectra-ng/charts/core';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'column-chart-currency-example',
  imports: [FormsModule, TxColumnChart, TxSelect],
  providers: [TxLocaleService],
  template: `
    <div class="stack">
      <tx-select
        ariaLabel="Language"
        [options]="languages"
        [ngModel]="locale.locale().code"
        (ngModelChange)="locale.setLocale($event)"
      />
      <tx-column-chart
        [series]="series"
        [categories]="quarters"
        [valueFormat]="usd"
        ariaLabel="Revenue by quarter"
      />
    </div>
  `,
  styles: `
    .stack {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartCurrencyExample {
  readonly locale = inject(TxLocaleService);
  readonly languages = [
    { label: 'English', value: 'us' },
    { label: 'Українська', value: 'ua' },
  ];
  readonly usd: TxChartCurrencyFormat = { currency: 'USD' };
  readonly quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  readonly series: TxChartSeries[] = [
    { name: 'New business', data: [36400, 41250.5, 38900, 52700] },
    { name: 'Renewals', data: [28100, 29800, 31450, 33900] },
  ];
}
