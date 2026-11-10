import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxColumnChart, TxColumnChartSeriesToggle } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-legend-example',
  imports: [TxColumnChart],
  template: `
    <div class="wrap">
      <tx-column-chart
        [series]="series"
        [categories]="quarters"
        legendPosition="bottom"
        legendAlign="center"
        ariaLabel="Headcount by department"
        (seriesToggle)="onToggle($event)"
      />
      <p class="log" aria-live="polite">{{ message() }}</p>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 8px;
      width: 100%;
    }
    .log {
      margin: 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartLegendExample {
  readonly quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  readonly series: TxChartSeries[] = [
    { name: 'Engineering', data: [42, 45, 51, 58] },
    { name: 'Sales', data: [18, 21, 24, 25] },
    { name: 'Support', data: [12, 12, 14, 17] },
    { name: 'Marketing', data: [8, 9, 9, 11] },
  ];
  readonly message = signal('Click a legend item.');

  onToggle(event: TxColumnChartSeriesToggle): void {
    this.message.set(`${event.name} is ${event.hidden ? 'hidden' : 'shown'}`);
  }
}
