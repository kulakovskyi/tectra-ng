import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxChartLegendVariant, TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'line-chart-legend-variants-example',
  imports: [TxLineChart, TxSelect, FormsModule],
  template: `
    <div class="wrap">
      <tx-select
        class="control"
        ariaLabel="Legend variant"
        [options]="variants"
        [(ngModel)]="variant"
      />
      <tx-line-chart
        [series]="series"
        [categories]="months"
        [height]="320"
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
export default class LineChartLegendVariantsExample {
  readonly variant = signal<TxChartLegendVariant>('stat');
  readonly variants = [
    { label: 'Dot', value: 'dot' },
    { label: 'Line', value: 'line' },
    { label: 'Pill', value: 'pill' },
    { label: 'Stat', value: 'stat' },
  ];
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  readonly series: TxChartSeries[] = [
    { name: 'Revenue', data: [42, 47, 45, 53, 58, 61, 66, 72] },
    { name: 'Costs', data: [31, 33, 36, 35, 39, 40, 42, 44] },
    { name: 'Profit', data: [11, 14, 9, 18, 19, 21, 24, 28] },
  ];
}
