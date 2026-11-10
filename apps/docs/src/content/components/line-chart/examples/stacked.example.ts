import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'line-chart-stacked-example',
  imports: [TxLineChart, TxToggleSwitch, FormsModule],
  template: `
    <div class="wrap">
      <tx-toggle-switch label="Show as 100%" [(ngModel)]="percent" />
      <tx-line-chart
        [series]="series"
        [categories]="quarters"
        stacked
        [stackType]="percent() ? '100%' : 'normal'"
        [height]="320"
        ariaLabel="Revenue by plan"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartStackedExample {
  readonly percent = signal(false);
  readonly quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'];
  readonly series: TxChartSeries[] = [
    { name: 'Starter', data: [12, 14, 15, 15, 17, 18] },
    { name: 'Team', data: [20, 24, 29, 33, 38, 44] },
    { name: 'Enterprise', data: [8, 9, 13, 18, 22, 30] },
  ];
}
