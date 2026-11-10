import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxChartLegendVariant, TxChartSeries } from '@tectra-ng/charts/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'column-chart-legend-variants-example',
  imports: [TxColumnChart, TxSelect, FormsModule],
  template: `
    <div class="wrap">
      <tx-select
        class="control"
        ariaLabel="Legend variant"
        [options]="variants"
        [(ngModel)]="variant"
      />
      <tx-column-chart
        [series]="series"
        [categories]="regions"
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
export default class ColumnChartLegendVariantsExample {
  readonly variant = signal<TxChartLegendVariant>('stat');
  readonly variants = [
    { label: 'Dot', value: 'dot' },
    { label: 'Line', value: 'line' },
    { label: 'Pill', value: 'pill' },
    { label: 'Stat', value: 'stat' },
  ];
  readonly regions = ['North', 'South', 'East', 'West'];
  readonly series: TxChartSeries[] = [
    { name: 'Online', data: [120, 98, 143, 110] },
    { name: 'Retail', data: [64, 71, 52, 80] },
  ];
}
