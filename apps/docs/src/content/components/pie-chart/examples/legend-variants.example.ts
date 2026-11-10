import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxChartLegendVariant } from '@tectra-ng/charts/core';
import { TxPieChart, TxPieData } from '@tectra-ng/charts/pie';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'pie-chart-legend-variants-example',
  imports: [TxPieChart, TxSelect, FormsModule],
  template: `
    <div class="wrap">
      <tx-select
        class="control"
        ariaLabel="Legend variant"
        [options]="variants"
        [(ngModel)]="variant"
      />
      <tx-pie-chart
        [pieData]="budget"
        [chartWidth]="440"
        [chartHeight]="360"
        totalLabel="Budget"
        [legendVariant]="variant()"
        ariaLabel="Legend variants"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .control {
      width: 180px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartLegendVariantsExample {
  readonly variant = signal<TxChartLegendVariant>('pill');
  readonly variants = [
    { label: 'Dot', value: 'dot' },
    { label: 'Line', value: 'line' },
    { label: 'Pill', value: 'pill' },
    { label: 'Stat', value: 'stat' },
  ];
  readonly budget: TxPieData = {
    series: [38, 24, 16, 12],
    labels: ['Salaries', 'Infrastructure', 'Marketing', 'Office'],
  };
}
